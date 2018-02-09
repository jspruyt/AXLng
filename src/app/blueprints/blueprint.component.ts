import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import 'brace/index';
import 'brace/theme/monokai';
import 'brace/mode/yamlx';
import 'brace/ext/language_tools.js';

import { Blueprint } from './blueprint.model';
import { BlueprintService } from './blueprint.service';

declare var ace: any;


@Component({
    selector: 'blueprint',
    templateUrl: 'blueprint.component.html'
})

export class BlueprintComponent implements OnInit {
    @Input() blueprintName: string;
    @Input() blueprintDescription: string;
    blueprintTemplate: string;
    aceOptions: any = { maxLines: 1000, printMargin: false, fontSize: '11pt' };
    // output: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private blueprints: BlueprintService,
    ) { }


    ngOnInit() {
        const name = this.route.snapshot.paramMap.get('name');
        console.log(name);
        if (name !== 'new') {
            this.blueprints.loadBlueprint(name)
            .subscribe(blueprint => {
                this.blueprintDescription = blueprint.description;
                this.blueprintName = blueprint.name;
                this.blueprintTemplate = blueprint.template;
            })
        }
    }

    closeBlueprint() {
        console.log('navigating to: /blueprints')
        this.router.navigateByUrl('/blueprints');
    }

    saveBlueprint() {
        const blueprint = new Blueprint();
        blueprint.name = this.blueprintName;
        blueprint.description = this.blueprintDescription;
        blueprint.template = this.blueprintTemplate;
        this.blueprints.saveBlueprint(blueprint);
    }

    listAll() {
        for (let i = 0, len = localStorage.length; i < len; ++i) {
            const key = localStorage.key(i);
            console.log(key + ':')
            console.log( localStorage.getItem( localStorage.key( i ) ) );
            // if (key.startsWith('blueprint.')) {
            //     definitions.push(localStorage.key(i));
            // }
        }
    }

    clearAll() {
        this.blueprints.clearAll();
    }







}
