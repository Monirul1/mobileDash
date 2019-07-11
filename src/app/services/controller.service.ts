import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

import {SchemaService} from './schema.service';
import {VerificationService} from './verification.service';
import {RestartService} from './restart.service';
import {Schema} from '../model/schema.model';
import {Node} from '../model/node.model';
import {Status} from '../model/status.enum';
import {Arrow} from '../model/arrow.model';

import {environment} from '../../environments/environment';

@Injectable()
export class ControllerService {
  schemaToLoad = 'ios';
  schema: Schema;
  arrows: Arrow[] = [];
  updateArrowsTimer;
  devMode = false;
  autoStart = false;

  schemaUpdated = new Subject();

  constructor(private schemaService: SchemaService,
              private verificationService: VerificationService,
              private restartService: RestartService) {

    this.verificationService.statusChanged
      .subscribe(change => this.setStatus(change.node, change.status));

    this.restartService.dependenciesChanged
      .subscribe(node => this.updateArrowsSoon());
  }

  setParams(url: string) {
    // TODO: more concise code using regex?
    const params = {};
    const i = url.indexOf('?');
    if (i !== -1) {
      const array = url.substr(i + 1).split('&');
      array.forEach(item => {
        const keyvalue = item.split('=');
        if (keyvalue.length) {
          const key = keyvalue[0].toLowerCase();
          const value = (keyvalue.length > 1 ? keyvalue[1] : '');
          params[key] = value;
        }
      });
    }
    if (params['dev']) {
      this.devMode = (params['dev'].toLowerCase() === 'true');
    } else {
      this.devMode = !environment.production;
    }
    if (params['start']) {
      this.autoStart = (params['start'].toLowerCase() === 'true');
    } else {
      this.autoStart = !this.devMode;
    }
    if (params['dashboard']) {
      this.schemaToLoad = params['dashboard'];
    }
    console.log('params - devMode=' + this.devMode);
    console.log('params - autoStart=' + this.autoStart);
    console.log('params - schemaToLoad=' + this.schemaToLoad);
  }

  loadSchema(): Observable<Schema> {
    if (this.schema) {
      return Observable.of(this.schema);
    } else {
      return this.schemaService.loadSchema(this.schemaToLoad)
        .map(schema => {
          this.schema = schema;
          schema.rootItems.forEach(item => {
            if (item.itemAsGroup) {
              item.itemAsGroup.computeRollups();
            }
          });
          this.updateArrows();
          return schema;
        });
    }
  }

  startPolling(nodes: Node[] = null) {
    this.verificationService.pollNodes(nodes || this.schema.nodes);
  }

  startPollingNode(node: Node) {
    this.verificationService.pollNode(node);
  }

  stopPolling() {
    this.verificationService.stopPolling();
  }

  setStatus(node: Node, status: Status) {
    console.log('setStatus ' + node.name + ' => ' + status);

    const oldStatus = node.status;
    if (status !== oldStatus) {
      console.log('...status for ' + node.name + ' changed from ' + oldStatus + ' => ' + status);
      node.setStatus(status);
      if (node.group) {
        node.group.computeRollups();
      }

      // wait till a bunch of setStatus's are called before updating arrows ONCE
      this.updateArrowsSoon();
    }
  }

  updateArrowsSoon() {
    if (!this.updateArrowsTimer) {
      this.updateArrowsTimer = setTimeout(() => {
        this.updateArrows();
        this.updateArrowsTimer = null;
      }, 50);
    }
  }

  updateArrows() {
    console.log('updateArrows');
    const arrows = this.getArrows();

    // only reset this.arrows if the arrows changed
    if (arrows.length !== this.arrows.length) {
      this.arrows = arrows;
    } else if (!arrows.every(arrow => this.arrows.some(sameArrow => arrow.sameAs(sameArrow)))) {
      this.arrows = arrows;
    }
    console.log('=>', this.arrows);
  }

  private getArrows(): Arrow[] {
    const arrowMap = {};
    this.schema.nodes.forEach(node => node.dependencies.forEach(dependency => {
      const items = Arrow.computeEndpoints(dependency, node);
      const key = items.item1.id + '=>' + items.item2.id;
      if (!arrowMap[key]) {
        const arrowStatus = (this.schema.vertical ? Status.GOOD : dependency.overallStatus);
        arrowMap[key] = new Arrow(items.item1, items.item2, arrowStatus, node.schema.vertical);
      }
    }));
    return Object.values(arrowMap);
  }
}
