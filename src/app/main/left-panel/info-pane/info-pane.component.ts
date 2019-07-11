import {Component, OnDestroy, OnInit} from '@angular/core';
import {ControllerService} from '../../../services/controller.service';

import {VerificationService} from '../../../services/verification.service';

import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-timer-pane',
  templateUrl: './info-pane.component.html',
  styleUrls: ['./info-pane.component.css']
})
export class TimerPaneComponent implements OnInit, OnDestroy {
  pollingTimeElapsed = 0;
  avgTimePerNode = 0;

  private tickInterval;

  constructor(private controller: ControllerService,
              private verificationService: VerificationService) { }

  ngOnInit() {
    this.tickInterval = setInterval(() => {
      if (this.verificationService.polling) {
        this.pollingTimeElapsed = Date.now() - this.verificationService.startedPollingTimestamp;
        this.avgTimePerNode = this.verificationService.avgTimePerNode;
      }
    }, 1000); // update time elapsed every second
  }

  ngOnDestroy() {
    clearInterval(this.tickInterval);
  }

  get schemaName(): string {
    return this.controller.schema.label;
  }

  get polling(): boolean {
    return this.verificationService.polling;
  }

  get version(): string {
    return environment.version;
  }

  onStart() {
    this.controller.startPolling();
  }

  onStop() {
    this.controller.stopPolling();
  }

  onToggle() {
    if (this.polling) {
      this.onStop();
    } else {
      this.onStart();
    }
  }

  formatElapsed(ms: number): string {
    const sec = Math.floor(ms / 1000);
    const hours   = Math.floor(sec / 3600);
    const minutes = Math.floor((sec - (hours * 3600)) / 60);
    const seconds = sec - (hours * 3600) - (minutes * 60);
    return (hours < 10 ? '0' + hours.toString() : hours.toString()) + ':' +
      (minutes < 10 ? '0' + minutes.toString() : minutes.toString()) + ':' +
      (seconds < 10 ? '0' + seconds.toString() : seconds.toString());
  }

  formatNodeTime(time: number): string {
    return Math.floor(time).toLocaleString() + ' ms';
  }
}
