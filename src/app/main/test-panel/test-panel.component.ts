import { Component, OnInit } from '@angular/core';

import {ControllerService} from '../../services/controller.service';
import {Node} from '../../model/node.model';
import {Status} from '../../model/status.enum';

@Component({
  selector: 'app-test-panel',
  templateUrl: './test-panel.component.html',
  styleUrls: ['./test-panel.component.css']
})
export class TestPanelComponent implements OnInit {

  constructor(private controller: ControllerService) { }

  ngOnInit() {
  }

  get nodes(): Node[] {
    return this.controller.schema.nodes;
  }

  onClick(node: Node) {
    // this.verificationService.pollNode(node);

    if (node.status === Status.GOOD) {
      this.controller.setStatus(node, Status.WARNING);
    } else if (node.status === Status.WARNING) {
      this.controller.setStatus(node, Status.ERROR);
    } else if (node.status === Status.ERROR) {
      this.controller.setStatus(node, Status.NONE);
    } else {
      this.controller.setStatus(node, Status.GOOD);
    }
  }
}
