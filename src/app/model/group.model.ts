import {Item} from './item.interface';
import {Node} from './node.model';
import {Status} from './status.enum';
import {Rollup} from './rollup.model';
import {Schema} from './schema.model';

export class Group implements Item {
  nodes: Node[] = [];
  rollups: Rollup[] = [];
  itemType = 'group';

  constructor(public schema: Schema, public name: string, public label: string,
              public collapsible: boolean, public wrap: boolean, public isRoot = false) {}

  get id(): string {
    return 'group-' + this.name;
  }

  computeRollups() {
    if (this.collapsible) {
      console.log('computeRollups');
      const statuses = [ Status.GOOD, Status.WARNING, Status.ERROR, Status.NONE ];
      const threshhold = 3;
      this.rollups = [];
      statuses.forEach(status => {
        const nodesWithStatus = this.nodes.filter(node => node.overallStatus === status);
        if (status === Status.GOOD || nodesWithStatus.length > threshhold) {
          this.rollups.push(new Rollup(this, status, nodesWithStatus));
        }
      });
    }
  }

  get breakouts(): Node[] {
    // filter nodes by node where none of the rollups contain this node
    return this.nodes.filter(node => !this.rollups.find(rollup => rollup.nodes.indexOf(node) !== -1));
  }

  get children(): Item[] {
    return [].concat(this.rollups).concat(this.breakouts);
  }

  get itemAsGroup(): Group {
    return this;
  }

  get itemAsNode(): Node {
    return null;
  }

  get numAcross() {
    const maxDown = 9;
    const maxAcross = 3;
    return (this.wrap ? Math.min(maxAcross, Math.ceil(this.nodes.length / maxDown)) : 1);
  }

}
