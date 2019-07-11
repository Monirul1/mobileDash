import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';

import {NgxAutoScrollModule} from 'ngx-auto-scroll';

import {ControllerService} from './services/controller.service';
import {SchemaService} from './services/schema.service';
import {VerificationService} from './services/verification.service';
import {ConfigVerificationService} from './services/playplex/config-verification.service';
import {ContentVerificationService} from './services/playplex/content-verification.service';
import {JenkinsVerificationService} from './services/jenkins/jenkins-verification.service';
import {RestartService} from './services/restart.service';
import {BroadcastService} from './services/broadcast.service';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { LeftPanelComponent } from './main/left-panel/left-panel.component';
import { TimerPaneComponent } from './main/left-panel/info-pane/info-pane.component';
import { RightPanelComponent } from './main/slide-panel/right-panel.component';
import { MessageListComponent } from './main/slide-panel/message-list/message-list.component';
import { TestPanelComponent } from './main/test-panel/test-panel.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GroupPanelComponent } from './dashboard/group-panel/group-panel.component';
import { NodePanelComponent } from './dashboard/node-panel/node-panel.component';
import { ArrowComponent } from './dashboard/arrow/arrow.component';
import { StatusDirective } from './dashboard/status.directive';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    NodePanelComponent,
    GroupPanelComponent,
    ArrowComponent,
    MainComponent,
    LeftPanelComponent,
    TimerPaneComponent,
    RightPanelComponent,
    MessageListComponent,
    TestPanelComponent,
    StatusDirective,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgxAutoScrollModule
  ],
  providers: [SchemaService, ControllerService, BroadcastService,
    VerificationService, ConfigVerificationService, ContentVerificationService, JenkinsVerificationService,
    RestartService],
  bootstrap: [AppComponent]
})
export class AppModule { }
