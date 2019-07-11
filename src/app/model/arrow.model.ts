import {Node} from './node.model';
import {Item} from './item.interface';
import {Status} from './status.enum';

export class Arrow {

  constructor(public item1: Item, public item2: Item, public status: Status, public vertical = false) {}

  static computeEndpoints(dependency: Node, node: Node): { item1: Item, item2: Item } {
    // TODO: good candidate for unit testing - does item1 & item2 come out to what I expect?
    let item1: Item = dependency;
    if (dependency.group && dependency.group.children.length === 1) {
      item1 = dependency.group;
    } else if (dependency.rollup) {
      item1 = dependency.rollup;
    } else if (dependency.group && dependency.group.wrap) {
      item1 = dependency.group;
    }

    let item2: Item = node;
    if (node.group) {
      if (!dependency.group) {
        item2 = node.group;
      } else if (dependency.rollup &&
          (dependency.status === Status.GOOD || dependency.status === Status.RUNNING ||
           dependency.status === Status.IDLE || dependency.status === Status.NONE)) {
        item2 = node.group;
      } else if (node.rollup) {
        item2 = node.rollup;
      }
    }

    return { item1, item2 };
  }

  sameAs(arrow: Arrow): boolean {
    return (this.item1 === arrow.item1 && this.item2 === arrow.item2 && this.status === arrow.status);
  }

}
