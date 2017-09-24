import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Http, Headers } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { NgxSoapModule } from 'ngx-soap';
import { SOAPService, Client } from 'ngx-soap';


import { AppComponent } from './app.component';
import { ToolListComponent } from './tool-list.component';
import { TesterToolComponent } from './tester-tool.component';
import { WsdlCombineService } from './wsdl-combine.service';
import { AxlService } from './axl.service';

const appRoutes: Routes = [
  { path: 'tools', component: ToolListComponent },
  // { path: 'creator', component: CreatorToolComponent },
  // { path: 'query',      component: QueryToolComponent },
  { path: 'tester',      component: TesterToolComponent },
  // { path: 'updater',      component: UpdaterToolComponent },
  { path: '',
    redirectTo: '/tools',
    pathMatch: 'full'
  },
];


@NgModule({
  declarations: [
    AppComponent,
    ToolListComponent,
    TesterToolComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgxSoapModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
  ],
  providers: [
    WsdlCombineService,
    AxlService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
