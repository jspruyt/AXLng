import { Component, OnInit } from '@angular/core';
import { enableDebugTools } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


import { AxlService } from './axltools/axl.service';
import { LoginDialogComponent } from './login/login-dialog.component';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    isConnected = false;
    username = 'AXLJOSP';
    password = 'D1data123';
    hostname = '10.170.126.10';
    version = '11.0';
    status= 'test';

    constructor(
        private axl: AxlService,
        public login: MatDialog
    ) { }

    ngOnInit() {
        // this.loadAxl();
    }

    loadAxl() {
        Observable.timer(500)
            .mergeMap((x) => {
                return this.axl.init(this.version, this.hostname, this.username, this.password);
            })
            .subscribe(success => {
                console.log('AXL Client succesfully loaded');
                this.status = 'AXL Client Loaded, verifiying connection...';
                this.getConnectionStatus();
            });
    }

    openLogin() {
        const loginDialog = this.login.open(LoginDialogComponent, {
            width: '350px',
            data: { username: this.username, password: this.password, hostname: this.hostname, version: this.version }
        });
        loginDialog.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            if (result) {
                let reload = false;
                if (this.username !== result.username) {
                    reload = true;
                    this.username = result.username
                }
                if (this.password !== result.password) {
                    reload = true;
                    this.password = result.password
                }
                if (this.hostname !== result.hostname) {
                    reload = true;
                    this.hostname = result.hostname
                }
                if (this.version !== result.version) {
                    reload = true;
                    this.version = result.version
                }
                if (reload || !this.axl.initialized) {
                    this.isConnected = false;
                    this.status = 'Building AXL Client...';
                    this.loadAxl();
                }
            }
        });
    }

    getConnectionStatus() {
        this.axl.testConnection()
            .subscribe(connected => {
                this.isConnected = connected;
                if (connected) {
                    this.status = 'Connected to AXL server';
                    console.log('AXL server reachable');
                    Observable.timer(3000)
                    .subscribe((x) => {
                        this.status = '';
                    })
                }
            });
    }
}
