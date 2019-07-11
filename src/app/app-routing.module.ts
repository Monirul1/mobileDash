import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';

// *** CURRENTLY UNUSED ***
//
// router breaks svg arrows
// see https://github.com/angular/angular/issues/11284
// solution for ng1: https://stackoverflow.com/questions/19742805/angular-and-svg-filters
//   not sure how to implement equivalent in ng5
//
const appRoutes: Routes = [
  { path: '', redirectTo: 'schema/default', pathMatch: 'full' },
  { path: 'schema', redirectTo: 'schema/default', pathMatch: 'full' },
  { path: 'schema/:schemaName', component: DashboardComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [ RouterModule.forRoot(appRoutes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {

}
