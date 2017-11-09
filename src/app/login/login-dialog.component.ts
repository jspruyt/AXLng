import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'login-dialog',
    templateUrl: 'login-dialog.component.html'
})

export class LoginDialogComponent implements OnInit {
    versions: string[]

    constructor(
        public dialogRef: MatDialogRef<LoginDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }

    ngOnInit() {
        this.versions = ['11.0', '11.5'];
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onConnect(): void {
        this.dialogRef.close();
    }
}
