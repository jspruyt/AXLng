import { Component, OnInit, Input } from '@angular/core';

import { Recipe } from '../recipes/recipe.model';
import { AxlResult } from './model';


@Component({
    selector: 'progress-log',
    templateUrl: 'progress-log.component.html'
})

export class ProgressLogComponent implements OnInit {

    @Input() recipe: Recipe;
    @Input() currentStep: string;
    @Input() bulkProgress: number;
    @Input() stepProgress: number;
    @Input() errors: AxlResult[];
    @Input() results: AxlResult[];

    constructor() { }

    ngOnInit() { }
}
