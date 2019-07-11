import {Component, Input, OnInit} from '@angular/core';

import {ControllerService} from '../../services/controller.service';
import {Node} from '../../model/node.model';
import {Status} from '../../model/status.enum';

@Component({
  selector: 'app-node-panel',
  templateUrl: './node-panel.component.html',
  styleUrls: ['./node-panel.component.css']
})
export class NodePanelComponent implements OnInit {
  @Input() node: Node;

  constructor(private controller: ControllerService) { }

  ngOnInit() {
  }

  onClick() {
    this.controller.startPollingNode(this.node);
  }

  isOffline(): boolean {
    return this.node.status === Status.NONE;
  }

}
