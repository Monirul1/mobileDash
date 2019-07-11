import {Component, OnInit} from '@angular/core';

import {ControllerService} from '../services/controller.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  showDevControls = true;
  showRightPanel = false;

  constructor(private controller: ControllerService) { }

  ngOnInit() {
    console.log('location', location);
    this.controller.setParams(location.href);
    this.showDevControls = this.controller.devMode;
  }

  toggleStatusPanel() {
    this.showRightPanel = !this.showRightPanel;
  }

}
