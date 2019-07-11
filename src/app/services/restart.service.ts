import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

import {Node} from '../model/node.model';

@Injectable()
export class RestartService {

  restartNode = new Subject<Node>();
  dependenciesChanged = new Subject<Node>();

}
