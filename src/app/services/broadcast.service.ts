import {Injectable} from '@angular/core';

import {environment} from '../../environments/environment';

@Injectable()
export class BroadcastService {
  // broadcaster = new Subject<string>();
  messages: { id: number, text: string }[] = [];

  private maxMessages = environment.maxMessages;
  private nextId = 1;

  broadcast(text: string) {
    // this.broadcaster.next(text);
    this.addMessage(text);
  }

  addMessage(text: string) {
    this.messages.push({ id: this.nextId++, text });
    if (this.messages.length > this.maxMessages) {
      this.messages.splice(0, 1);
    }
  }
}
