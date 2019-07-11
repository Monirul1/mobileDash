import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/takeWhile';

import {ConfigVerificationService} from './playplex/config-verification.service';
import {ContentVerificationService} from './playplex/content-verification.service';
import {JenkinsVerificationService} from './jenkins/jenkins-verification.service';
import {BroadcastService} from './broadcast.service';
import {RestartService} from './restart.service';
import {Node} from '../model/node.model';
import {Status} from '../model/status.enum';

import {environment} from '../../environments/environment';

@Injectable()
export class VerificationService {
  statusChanged = new Subject<{ node: Node, status: Status }>();
  polling = false;
  startedPollingTimestamp;
  stoppedPollingTimestamp;
  timeSinceLastError;
  avgTimePerNode = 0;

  private stopPollingFlag = new Subject<boolean>();
  private nodesToPoll = [];
  private pollingIntervalInSeconds = environment.pollingIntervalInSeconds;
  private timeoutInSeconds = environment.requestTimeoutInSeconds;
  private throttleInMs = environment.throttleInMs;

  private nodeErrorTimestampMap = {}; // node.name => { node, timestamp }
  private nodeTimings = {}; // node.name => [ last n timings for node ]
  private numTimingsForAvg = environment.numTimingsForAvg;

  constructor(private configVerificationService: ConfigVerificationService,
              private contentVerificationService: ContentVerificationService,
              private jenkinsVerificationService: JenkinsVerificationService,
              private broadcaster: BroadcastService,
              private restartService: RestartService) {

    this.restartService.restartNode
      .subscribe((node: Node) => {
        if (this.nodesToPoll.includes(node)) {
          this.verifyNode(node);
        }
      });
  }

  pollNodes(nodes: Node[]) {
    nodes.forEach(node => this.pollNode(node));
  }

  pollNode(node: Node) {
    if (!this.nodesToPoll.includes(node)) {
      this.nodesToPoll.push(node);
    }
    this.startPolling();
  }

  stopPolling() {
    this.stopPollingFlag.next(true);
  }

  startPolling() {
    if (!this.polling) {
      console.log('start polling');
      this.broadcaster.broadcast('start polling');
      this.polling = true;
      this.startedPollingTimestamp = Date.now();
      this.nodeErrorTimestampMap = {};
      this.nodeTimings = {};
      this.avgTimePerNode = 0;
      Observable.timer(0, this.pollingIntervalInSeconds * 1000)
        .takeUntil(this.stopPollingFlag)
        .flatMap(() => {
          const queue = [].concat(this.nodesToPoll);
          return this.sprayNodes(queue);
        })
        .subscribe(
          () => {

          },
          error => {
            console.error('error caught in startPolling:', error);
          },
          () => {
            console.log('polling completed');
            this.broadcaster.broadcast('stop polling');
            this.polling = false;
            this.stoppedPollingTimestamp = Date.now();
          });
    }
  }

  sprayNodes(queue: Node[]): Observable<any> {
    console.log('---POLLING---');
    return Observable.timer(0, this.throttleInMs)
      .takeWhile(() => queue.length !== 0)
      .takeUntil(this.stopPollingFlag)
      .flatMap(() => {
        const node: Node = queue.shift();
        return this.verifyNode(node);
      });
  }

  verifyNode(node: Node): Observable<boolean> {
    console.log('verifyNode: ' + node.name);
    const startTime = Date.now();
    return this.verifyByType(node)
      .catch(error => {
        console.log('caught error from ' + node.name + ' in inner catch: ', error);
        return Observable.of(false);
      })
      .do(verified => {
        const elapsed = Date.now() - startTime;
        this.computeAvgTimePerNode(node, elapsed);
      })
      .do(verified => {
        if (!verified) {
          this.broadcaster.broadcast('*** ' + node.name + ' => ERROR!');
          this.timeSinceLastError = Date.now();
          this.setNodeErrorTimestamp(node);
        }
        const status = (verified ? Status.GOOD : Status.ERROR);
        if (status !== node.status) {
          console.log('statusChanged for ' + node.name);
          this.statusChanged.next({ node, status });
        }
      });
  }

  private verifyByType(node: Node): Observable<boolean> {
    switch (node.verificationType) {
      case 'config':
        return this.configVerificationService.verify(node);
      case 'api':
        return this.contentVerificationService.verify(node);
      case 'build':
        return this.jenkinsVerificationService.verify(node);
      default:
        return Observable.of(true);
    }
  }

  private computeAvgTimePerNode(node: Node, elapsed) {
    this.addTiming(node, elapsed);
    let total = 0;
    let n = 0;
    Object.values(this.nodeTimings).forEach((timings: Array<number>) => timings.forEach(timing => {
      total += timing;
      n++;
    }));
    this.avgTimePerNode = total / n;
  }

  private addTiming(node: Node, elapsed) {
    const timings = this.nodeTimings[node.name] || [];
    timings.push(elapsed);
    if (timings.length > this.numTimingsForAvg) {
      timings.splice(0, 1);
    }
    this.nodeTimings[node.name] = timings;
  }

  private setNodeErrorTimestamp(node: Node) {
    this.nodeErrorTimestampMap[node.name] = { node, timestamp: Date.now() };
  }

  public nodesWithErrors(): Node[] {
    return Object.values(this.nodeErrorTimestampMap).map(item => item['node']);
  }

  public nodeErrorTimestamps() {
    return Object.values(this.nodeErrorTimestampMap);
  }

}
