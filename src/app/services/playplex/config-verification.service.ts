import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/concat';

import {Node} from '../../model/node.model';
import {Config} from './config.model';
import {Screen} from './screen.model';
import {BroadcastService} from '../broadcast.service';
import {RestartService} from '../restart.service';
import {Verify} from '../verify.interface';

import {environment} from '../../../environments/environment';

@Injectable()
export class ConfigVerificationService implements Verify {
  timeoutInSeconds = environment.requestTimeoutInSeconds;
  numRetries = environment.numRetries;
  retryDelayInMs = environment.retryDelayInMs;

  constructor(private http: HttpClient, private broadcaster: BroadcastService, private restartService: RestartService) {
  }

  verify(node: Node): Observable<boolean> {
    try {
      const url = environment.playplexApi + node.verificationUrl;
      console.log('verify node: ' + node.name + ' => ' + url);
      this.broadcaster.broadcast('hitting ' + node.name + ' - config');
      return this.http.get(url)
        .timeout(this.timeoutInSeconds * 1000)
        .retryWhen(error => {
          console.log('retrying ' + node.name + ' from error:', error);
          return error
            .delay(this.retryDelayInMs)
            .take(this.numRetries)
            .concat(Observable.throw(new Error('retry limit exceeded')));
        })
        .flatMap(response => {
          if (!this.isOK(response)) {
            throw new Error('config response code != OK');
          }
          const config = this.parseConfig(response);
          if (!config) {
            throw new Error('error parsing config');
          }
          const home: Screen = config.screens.find(screen => screen.type === 'home');
          if (!home) {
            throw new Error('home screen not found');
          }
          node.properties['configId'] = config.configId;
          node.properties['homeScreenId'] = home.id;
          return this.verifyScreen(node, home);
        })
        .catch(error => {
          console.error(`config-verification error for ${node.name}:`, error);
          return Observable.of(false);
        });
    } catch (error) {
      console.log(`config-verification general error for ${node.name}:`, error);
      return Observable.of(false);
    }
  }

  private verifyScreen(node: Node, screen: Screen): Observable<boolean> {
    try {
      this.broadcaster.broadcast('hitting ' + node.name + ' - screen');

      return this.http.get(screen.url)
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
            throw new Error('screen response code != OK');
          }
          const dataSource = this.parseDataSource(response);
          if (!dataSource || !dataSource.url) {
            throw new Error('no dataSource');
          }
          // console.log(`dataSource for ${node.name}/${screen.type}: ${dataSource.url}`);
          const apiNode = this.getApiNode(node);
          if (!apiNode) {
            throw new Error('apiNode not found');
          }
          // console.log(`apiNode for ${node.name} => ${apiNode.name}`);
          if (apiNode.verificationUrl !== dataSource.url) {
            console.log('old verification url: ' + apiNode.verificationUrl);
            console.log('new verification url: ' + dataSource.url);
            apiNode.verificationUrl = dataSource.url;
            this.restartService.restartNode.next(apiNode);
          }
          return true;
        })
        .catch(error => {
          console.log(`verifyScreen error for ${node.name}/${screen.type}:`, error);
          return Observable.of(false);
        });
    } catch (error) {
      console.log(`verifyScreen general error for ${node.name}/${screen.type}:`, error);
      return Observable.of(false);
    }
  }

  private getApiNode(node: Node): Node {
    // go from config node to app node to api node
    if (node.clients.length) {
      const appNode = node.clients[0];
      const apiNode = appNode.dependencies.find(dependency => dependency.verificationType === 'api');
      return apiNode;
    }
    return null;
  }

  private isOK(response): boolean {
    return response && response.status && response.status.text === 'OK';
  }

  private parseConfig(json): Config {
    try {
      if (!this.isOK(json)) {
        return null;
      } else {
        const config = new Config();
        config.configId = this.parseConfigId(json);
        if (json.data && json.data.appConfiguration) {
          json = json.data.appConfiguration;
          config.imageServer = json.imageServer;
          config.logoImage = json.logoImage;
          if (json.screens && Array.isArray(json.screens)) {
            json.screens.forEach(screen => {
              config.screens.push(new Screen(screen.screen.id, screen.screen.type, screen.screen.url, screen.screen.urlTimestamp));
            });
          }
        }
        return config;
      }
    } catch (error) {
      console.error('error parsing config', error);
      return null;
    }
  }

  private parseConfigId(json): string {
    try {
      if (!this.isOK(json)) {
        return null;
      } else if (json.messages &&
                 json.messages.notices &&
                 Array.isArray(json.messages.notices) &&
                 json.messages.notices.length) {
        const notice = json.messages.notices[0]; // "App Configuration Object ID: 3a166513-5605-4db1-8807-0aec0b5e78e8"
        const i = notice.indexOf(':');
        return notice.substr(i + 2);
      } else {
        throw new Error('configId notice missing');
      }
    } catch (error) {
      console.error('error parsing config id', error);
      return null;
    }
  }

  private parseDataSource(json): { url: string, timestamp: number } {
    try {
      if (!this.isOK(json)) {
        return null;
      } else if (json.data &&
                 json.data.screen &&
                 json.data.screen.modules &&
                 Array.isArray(json.data.screen.modules) &&
                 json.data.screen.modules.length) {
        const modules = json.data.screen.modules;
        if (modules.length !== 1) {
          console.warn('screen has > 1 module (unexpected): ' + json.data.screen.url);
        }
        const module = json.data.screen.modules[0].module;
        return {url: module.dataSource, timestamp: module.dataSourceTimestamp};
      } else {
        throw new Error('module not found');
      }
    } catch (error) {
      console.error('error parsing data source', error);
      return null;
    }
  }
}
