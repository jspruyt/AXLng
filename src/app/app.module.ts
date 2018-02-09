import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatCardModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatExpansionModule,
    MatIconModule,
    MatDialogModule,
} from '@angular/material';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Http, Headers } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { NgxSoapModule } from 'ngx-soap';
import { SOAPService, Client } from 'ngx-soap';
import { ReactiveFormsModule } from '@angular/forms';
import { AceEditorModule, AceEditorDirective, AceEditorComponent } from 'ng2-ace-editor';

import { AppComponent } from './app.component';
import { CreatorToolComponent } from './axltools/creator-tool.component';
import { BlueprintComponent } from './blueprints/blueprint.component';
import { BlueprintListComponent } from './blueprints/blueprint-list.component';
import { ToolListComponent } from './axltools/tool-list.component';
import { TesterToolComponent } from './axltools/tester-tool.component';
import { SchemaToolComponent } from './axltools/schema-tool.component';
import { AxlService } from './axltools/axl.service';
import { WsdlService } from './axltools/wsdl.service';
import { PercentService } from './percent/percent.service';
import { BlueprintService } from './blueprints/blueprint.service';
import { WsdlCombineService } from './axltools/wsdl-combine.service';
import { ProgressLogComponent } from './axltools/progress-log.component';
import { LoginDialogComponent } from './login/login-dialog.component';

const appRoutes: Routes = [
    { path: 'tools', component: ToolListComponent },
    { path: 'creator', component: CreatorToolComponent },
    { path: 'tester', component: TesterToolComponent },
    { path: 'blueprints/:name', component: BlueprintComponent},
    { path: 'blueprints', component: BlueprintListComponent},
    { path: 'schema', component: SchemaToolComponent},
    {
        path: '',
        redirectTo: '/tools',
        pathMatch: 'full'
    },
];


@NgModule({
    declarations: [
        AppComponent,
        CreatorToolComponent,
        BlueprintComponent,
        BlueprintListComponent,
        ToolListComponent,
        TesterToolComponent,
        ProgressLogComponent,
        LoginDialogComponent,
        SchemaToolComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AceEditorModule,
        FormsModule,
        FlexLayoutModule,
        NgxSoapModule,
        ReactiveFormsModule,
        RouterModule.forRoot(
            appRoutes,
            { enableTracing: true } // <-- debugging purposes only
        ),
        MatButtonModule,
        MatCheckboxModule,
        MatCardModule,
        MatProgressBarModule,
        MatToolbarModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatInputModule,
        MatExpansionModule,
        MatIconModule,
        MatDialogModule,
    ],
    providers: [
        AxlService,
        WsdlService,
        PercentService,
        BlueprintService,
        WsdlCombineService,
    ],
    bootstrap: [
        AppComponent,
    ],
    entryComponents: [LoginDialogComponent]
})
export class AppModule { }
