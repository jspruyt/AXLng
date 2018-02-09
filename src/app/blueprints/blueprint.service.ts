import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
// import { of } from 'rxjs/observable/of';
// import 'rxjs/add/operator/do';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/mergeMap';
// import 'rxjs/add/operator/catch';
// import 'rxjs/add/observable/throw';

import { Blueprint } from './blueprint.model';


@Injectable()
export class BlueprintService {

    constructor() { }

    private getKey(name: string): string {
        return 'blueprint.' + name;
    }

    saveBlueprint(blueprint: Blueprint) {
        if (blueprint.validate()) {
            const id = this.getKey(blueprint.name);
            localStorage.setItem(id, blueprint.toJSON());
        } else {
            console.log('error saving blueprint, blueprint not valid');
        }
    }

    loadBlueprint(name: string): Observable<Blueprint> {
        const key = this.getKey(name);
        const blueprint = new Blueprint().fromJSON(localStorage.getItem(key));
        return Observable.of(blueprint);
    }

    getBlueprints(): Blueprint[] {
        const blueprints: Blueprint[] = [];
        for (let i = 0, len = localStorage.length; i < len; ++i) {
            const key = localStorage.key(i);
            if (key.startsWith('blueprint.')) {
                blueprints.push(new Blueprint().fromJSON(localStorage.getItem(key)))
            }
        }
        blueprints.sort((a: Blueprint, b: Blueprint) => {
            return a.name.localeCompare(b.name);
        })
        return blueprints;
    }

    clearAll() {
        localStorage.clear();
    }
}
