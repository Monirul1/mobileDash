import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/concat';

import {Node} from '../../model/node.model';
import {BroadcastService} from '../broadcast.service';
import {Verify} from '../verify.interface';

import {environment} from '../../../environments/environment';

@Injectable()
export class ContentVerificationService implements Verify {
  timeoutInSeconds = environment.requestTimeoutInSeconds;
  numRetries = environment.numRetries;
  retryDelayInMs = environment.retryDelayInMs;

  constructor(private http: HttpClient, private broadcaster: BroadcastService) {}

  verify(node: Node): Observable<boolean> {
    try {
      if (!node.verificationUrl) {
        return Observable.of(true);
      } else {
        this.broadcaster.broadcast('hitting ' + node.name);
        return this.http.get(node.verificationUrl)
          .timeout(this.timeoutInSeconds * 1000)
          .retryWhen(error => {
            console.log('retrying ' + node.name + ' from error:', error);
            return error
              .delay(this.retryDelayInMs)
              .take(this.numRetries)
              .concat(Observable.throw(new Error('retry limit exceeded')));
          })
          .map(response => {
            if (!this.isOK(response)) {
              throw new Error('config response code != OK');
            }
            if (this.getItemCount(response) <= 0) {
              throw new Error('no content items');
            }
            return true;
          })
          .catch(error => {
            console.error(`content-verification error for ${node.name}:`, error);
            return Observable.of(false);
          });
      }
    } catch (error) {
      console.log('content-verification error for ' + node.name);
      return Observable.of(false);
    }
  }

  private isOK(response): boolean {
    return response && response.status && response.status.text === 'OK';
  }

  private getItemCount(json): number {
    try {
      if (!this.isOK(json)) {
        return -1;
      } else if (json.data && json.data.items && Array.isArray(json.data.items)) {
        return json.data.items.length;
      } else {
        throw new Error('items not found');
      }
    } catch (error) {
      console.warn('error parsing data source item count', error);
      return -1;
    }
  }

}
