import {Item} from './item.interface';
import {Group} from './group.model';
import {Node} from './node.model';
import {Status} from './status.enum';

export class Rollup implements Item {
  isRoot = false;
  itemType = 'rollup';

  constructor(public group: Group, public status: Status, public nodes: Node[]) {}

  get name(): string {
    return this.status;
  }

  get label(): string {
    return this.status;
  }

  get id(): string {
    return 'rollup-' + this.group.name + '-' + this.name;
  }

  get itemAsGroup(): Group {
    return null;
  }

  get itemAsNode(): Node {
    return null;
  }

}
