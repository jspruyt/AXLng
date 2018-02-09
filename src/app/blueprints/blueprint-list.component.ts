import { Component, OnInit } from '@angular/core';

import { Blueprint } from './blueprint.model';
import { BlueprintService } from './blueprint.service';


@Component({
    selector: 'blueprint-list',
    templateUrl: 'blueprint-list.component.html'
})

export class BlueprintListComponent implements OnInit {
    blueprintList: Blueprint[];

    constructor(
        private blueprints: BlueprintService,
    ) { }

    ngOnInit() {
        this.blueprintList = this.blueprints.getBlueprints();
    }
}
