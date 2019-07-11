import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {ControllerService} from '../services/controller.service';
import {RestartService} from '../services/restart.service';
import {Schema} from '../model/schema.model';
import {Item} from '../model/item.interface';
import {Node} from '../model/node.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  schema: Schema;
  columns: Item[][] = []; // columns of groups or nodes
  nodes: Node[] = [];

  private subscriptions: Subscription[] = [];

  constructor(private controller: ControllerService, private restartService: RestartService) {}

  ngOnInit() {
    console.log('dashboard ngInit');

    this.subscriptions.push(this.controller.loadSchema().subscribe(schema => {
      this.schema = schema;
      this.columns = this.organize(schema);
      this.nodes = this.sortNodes(schema.nodes);
      if (this.controller.autoStart) {
        this.controller.startPolling();
      }
    }));

    this.subscriptions.push(this.restartService.dependenciesChanged.subscribe(() => {
      this.columns = this.organize(this.schema);
      this.nodes = this.sortNodes(this.schema.nodes);
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  get arrows() {
    return this.controller.arrows;
  }

  private organize(schema: Schema): Item[][] {
    if (schema.vertical) {
      return this.organizeVertical(schema);
    } else {
      return this.organizeHorizontal(schema);
    }
  }

  private organizeVertical(schema: Schema): Item[][] {
    const columns = [ ];
    schema.rootItems.filter(item => item.isRoot).forEach(root => {
      const column = [ root ];
      columns.push(column);
      this.organizeDependencies(column, root.itemAsNode);
    });
    return columns;
  }

  private organizeHorizontal(schema: Schema): Item[][] {
    const leftColumn = [];
    const rightColumn = [];
    const columns = [ leftColumn, rightColumn ];
    schema.rootItems.filter(item => item.isRoot).forEach(root => {
      rightColumn.push(root);
      if (root.itemAsGroup) {
        root.itemAsGroup.nodes.forEach(node => this.organizeDependencies(leftColumn, node));
      } else {
        this.organizeDependencies(leftColumn, root.itemAsNode);
      }
    });
    return columns;
  }

  private organizeDependencies(column: Item[], node: Node) {
    node.dependencies.forEach(
      dependency => {
        const item: Item = dependency.group || dependency;
        if (column.indexOf(item) === -1) {
          column.push(item);
          const group = item.itemAsGroup;
        }
      });
  }

  private sortNodes(nodes: Node[]): Node[] {
    return nodes.sort((a, b) => {
      if (a.label.toLowerCase() < b.label.toLowerCase()) {
        return -1;
      } else if (a.label.toLowerCase() > b.label.toLowerCase()) {
        return 1;
      } else {
        return 0;
      }
    });
  }

}
