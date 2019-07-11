import {Component, HostListener, Input, OnInit} from '@angular/core';

import {Arrow} from '../../model/arrow.model';
import {Item} from '../../model/item.interface';
import {Status} from '../../model/status.enum';
import {StyleUtils} from '../style.utils';

@Component({
  selector: 'app-arrow',
  templateUrl: './arrow.component.html',
  styleUrls: ['./arrow.component.css']
})
export class ArrowComponent implements OnInit {
  @Input() arrow: Arrow;
  x1: number;
  y1: number;
  x2: number;
  y2: number;

  statuses = [ Status.GOOD, Status.WARNING, Status.ERROR, Status.RUNNING, Status.IDLE, Status.NONE ];

  defaultColor = 'dimgray'; // 'whitesmoke'; // 'dimgray'; // '#a3a3a3';
  arrowColors = {
    'good': this.defaultColor,
    'warning': StyleUtils.getBgColor(Status.WARNING),
    'error': StyleUtils.getBgColor(Status.ERROR),
    'running': StyleUtils.getBgColor(Status.RUNNING),
    'idle': StyleUtils.getBgColor(Status.IDLE),
    'none': this.defaultColor };

  constructor() { }

  ngOnInit() {
    this.computeArrowCoordinates();
  }

  @HostListener('window:resize') onResize() {
    this.computeArrowCoordinates();
  }

  private computeArrowCoordinates() {
    const element1 = this.getElement(this.arrow.item1);
    const element2 = this.getElement(this.arrow.item2);
    if (element1 && element2) {
      const rect1 = element1.getBoundingClientRect();
      const rect2 = element2.getBoundingClientRect();

      if (this.arrow.vertical) {
        this.x1 = rect1.left + rect1.width / 2;
        this.y1 = rect1.top;
        this.x2 = this.x1;
        this.y2 = rect2.top + rect2.height;

      } else { // horizontal
        this.x1 = rect1.left + rect1.width;
        this.y1 = rect1.top + rect1.height / 2;
        this.x2 = rect2.left - 2; // stop slightly short of the destination so arrow tip doesn't blend w/target
        this.y2 = rect2.top + rect2.height / 2;

        const delta = Math.abs(this.y2 - this.y1);
        if (delta > 30) {
          if (this.y2 > this.y1) { // arrow pointing downward
            this.y2 -= 10;
          } else if (this.y2 < this.y1) { // arrow pointing upward
            this.y2 += 10;
          }
        }
      }
    }
  }

  getElement(item: Item): HTMLElement {
    return document.getElementById(item.id);
  }

}
