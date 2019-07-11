import {Directive, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges} from '@angular/core';

import {Status} from '../model/status.enum';

@Directive({
  selector: '[appStatus]'
})
export class StatusDirective implements OnInit, OnChanges {
  @Input('appStatus') status: Status;

  constructor(private renderer: Renderer2, private element: ElementRef) {}

  ngOnInit() {
    this.updateStyle(this.status);
  }

  ngOnChanges(changes: SimpleChanges) {
    const change = changes['status'];
    this.updateStyle(change.currentValue, change.previousValue);
  }

  updateStyle(status: Status, oldStatus?: Status) {
    if (oldStatus) {
      this.renderer.removeClass(this.element.nativeElement, 'style-' + oldStatus);
    }
    this.renderer.addClass(this.element.nativeElement, 'style-' + status);
  }
}
