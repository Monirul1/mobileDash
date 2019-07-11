import {Observable} from 'rxjs/Observable';

import {Node} from '../model/node.model';

export interface Verify {
  verify(node: Node): Observable<boolean>;
}
