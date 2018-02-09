import { Component, OnInit, Input } from '@angular/core';

import { Blueprint } from '../blueprints/blueprint.model';
import { AxlResult } from './model';


@Component({
    selector: 'progress-log',
    templateUrl: 'progress-log.component.html'
})

export class ProgressLogComponent implements OnInit {

    @Input() blueprint: Blueprint;
    @Input() currentStep: string;
    @Input() bulkProgress: number;
    @Input() stepProgress: number;
    @Input() errors: AxlResult[];
    @Input() results: AxlResult[];

    constructor() { }

    ngOnInit() { }
}
