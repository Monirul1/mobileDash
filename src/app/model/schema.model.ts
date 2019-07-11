import {Item} from './item.interface';
import {Node} from './node.model';

export class Schema {
  label: string;
  vertical = false;
  rootItems: Item[] = [];
  nodes: Node[] = [];

  constructor(public name: string) {}

}
