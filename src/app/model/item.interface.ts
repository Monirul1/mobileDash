import {Group} from './group.model';
import {Node} from './node.model';

export interface Item {
  id: string;
  name: string;
  label: string;
  itemType: string;
  itemAsGroup: Group;
  itemAsNode: Node;
  isRoot: boolean;
}
