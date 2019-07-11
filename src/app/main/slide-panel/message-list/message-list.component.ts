import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import {BroadcastService} from '../../../services/broadcast.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnInit {
  @ViewChild('messageList') messageList: ElementRef;

  constructor(private broadcaster: BroadcastService) { }

  ngOnInit() {
    setTimeout(() => {
      this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
    }, 100);
  }

  get messages() {
    return this.broadcaster.messages;
  }

  trackMsg(index, msg) {
    // use trackBy with *ngFor to prevent dom elements from being recreated
    // once msgs start being spliced from the top of the array...
    return msg.id;
  }

}
