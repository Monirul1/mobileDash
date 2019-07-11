import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {Computer} from './computer.model';
import {Node} from '../../model/node.model';
import {Status} from '../../model/status.enum';
import {Group} from '../../model/group.model';
import {Verify} from '../verify.interface';
import {RestartService} from '../restart.service';

import {environment} from '../../../environments/environment';

@Injectable()
export class JenkinsVerificationService implements Verify {

  constructor(private http: HttpClient, private restartService: RestartService) {}

  verify(node: Node): Observable<boolean> {
    console.log('getting computers');
    return this.getComputers(node.verificationUrl)
      .map(computers => {
        if (computers && computers.length) {
          console.log('got computers', computers);
          let updated = false;
          // assumption: schema.rootItems are all nodes (not groups)
          node.schema.rootItems.forEach(item => {
            if (this.updateNodes(item.itemAsNode, computers)) {
              updated = true;
            }
          });
          if (updated) {
            this.restartService.dependenciesChanged.next(node);
          }
          return true;

        } else {
          console.log('jenkins request failed');
          node.schema.rootItems.forEach(item => {
            console.log('jenkins - failing node:', item);
            item.itemAsNode.setStatus(Status.ERROR);
            item.itemAsNode.dependencies.forEach(dependent => dependent.statusUncertain = true);
          });
          return false;
        }
      });
  }

  updateNodes(node: Node, computers: Computer[]): boolean {
    let addedOrRemoved = false;

    const updated = [];
    let group: Group;
    const subsetOfComputers = this.filterAndSort(computers, node.responseFilter);
    subsetOfComputers.forEach(computer => {
      let dependency = node.dependencies.find(d => d.name === computer.name);
      if (!dependency) {
        if (!group) {
          if (node.dependencies.length) {
            group = node.dependencies[0].group;
          } else {
            group = new Group(node.schema, node.name + '-computers', node.label + ' Computers', false, true);
          }
        }
        dependency = new Node(node.schema, computer.name);
        dependency.label = computer.name;
        dependency.offlineReason = computer.offlineReason;
        dependency.group = group;
        group.nodes.push(dependency);
        node.dependencies.push(dependency);
        addedOrRemoved = true;
      }
      dependency.setStatus(computer.offline ? Status.NONE : (computer.idle ? Status.IDLE : Status.RUNNING));
      updated.push(dependency);
    });

    node.dependencies.forEach(dependency => {
      if (!updated.includes(dependency)) {
        dependency.setStatus(Status.ERROR);
        addedOrRemoved = false;
      }
    });

    return addedOrRemoved;
  }

  filterAndSort(computers: Computer[], group: string): Computer[] {
    return computers
      .filter(computer => computer.labels.includes(group))
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        } else if (a.name > b.name) {
          return 1;
        } else {
          return 0;
        }
      });
  }

  getComputers(url: string): Observable<any[]> {
    return this.http.get(environment.jenkinsApi + url)
      .map(response => {
        const computers: Computer[] = [];
        if (response['computer'] && Array.isArray(response['computer'])) {
          response['computer'].forEach(jsonComputer => {
            const computer = this.parseComputer(jsonComputer);
            if (computer) {
              computers.push(computer);
            }
          });
        } else {
          throw new Error('computer array not found');
        }
        return computers;
      })
      .do(computers => {
        const subsets = {}; // map label => { label, array of computers with that label }
        computers.forEach(computer => {
          computer.labels.forEach(label => {
            const subset = subsets[label] || { label, computers: [] };
            subset.computers.push(computer);
            subsets[label] = subset;
          });
        });
        const groups = Object.values(subsets).filter((subset: { label: string, computers: Computer[] }) => subset.computers.length > 1);
        console.log('computer groups:', groups);
      })
      .catch(error => {
        console.log('error getting jenkins computers', error);
        return Observable.of([]);
      });
  }

  private parseComputer(json): Computer {
    try {
      const computer = new Computer(json.displayName, json.description, json.idle,
        json.offline, json.temporarilyOffline, json.offlineCauseReason);
      if (json.assignedLabels && Array.isArray(json.assignedLabels)) {
        computer.labels = json.assignedLabels.map(label => label.name);
      }
      return computer;
    } catch (error) {
      console.log('error parsing computer', json);
      return new Computer('error', 'error', true, true, false, 'parse error');
    }
  }

}
