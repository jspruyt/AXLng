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
        this.versions = ['8.0', '8.5', '9.0', '9.1', '10.0', '10.5', '11.0'];
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onConnect(): void {
        this.dialogRef.close();
    }
}
