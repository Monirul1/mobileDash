import {Component, Input, OnInit} from '@angular/core';

import {Group} from '../../model/group.model';
import {Node} from '../../model/node.model';
import {Status} from '../../model/status.enum';
import {ControllerService} from '../../services/controller.service';

@Component({
  selector: 'app-group-panel',
  templateUrl: './group-panel.component.html',
  styleUrls: ['./group-panel.component.css']
})
export class GroupPanelComponent implements OnInit {
  @Input() group: Group;

  constructor(private controller: ControllerService) { }

  ngOnInit() {
  }

  isBad(status: Status): boolean {
    return status === Status.WARNING || status === Status.ERROR;
  }

  getBrands(nodes: Node[]): string {
    return nodes.map(node => node.brand).join(', ');
  }

  onClick(nodes: Node[]) {
    this.controller.startPolling(nodes);
  }

}
