import {Item} from './item.interface';
import {Group} from './group.model';
import {Status} from './status.enum';
import {Rollup} from './rollup.model';
import {Schema} from './schema.model';

export class Node implements Item {
  isRoot = false;
  label: string;
  brand: string;
  verificationType: string;
  verificationUrl: string;
  responseFilter: string;
  offlineReason: string;
  group: Group;
  dependencies: Node[] = [];  // nodes that this node depends upon
  clients: Node[] = [];       // nodes that depend upon this node
  properties = {};            // custom properties depending on node type
  itemType = 'node';
  statusUncertain = false;

  private _status = Status.GOOD;

  constructor(public schema: Schema, public name: string) {}

  get id(): string {
    return 'node-' + this.name;
  }

  get status(): Status {
    return this._status;
  }

  // new status should be set from controller service
  setStatus(status: Status) {
    this._status = status;
    this.statusUncertain = false;
  }

  get overallStatus(): Status {
    if (this.status === Status.ERROR || this.status === Status.WARNING) {
      return this.status;
    } else if (this.dependencies
        .find(dependency => dependency.overallStatus === Status.WARNING || dependency.overallStatus === Status.ERROR)) {
      return Status.WARNING;
    } else {
      return this.status;
    }
  }

  get rollup(): Rollup {
    if (this.group) {
      return this.group.rollups.find(rollup => rollup.nodes.indexOf(this) !== -1);
    } else {
      return null;
    }
  }

  get itemAsGroup(): Group {
    return null;
  }

  get itemAsNode(): Node {
    return this;
  }

}
