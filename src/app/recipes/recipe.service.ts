import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
// import { of } from 'rxjs/observable/of';
// import 'rxjs/add/operator/do';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/mergeMap';
// import 'rxjs/add/operator/catch';
// import 'rxjs/add/observable/throw';

import { Recipe } from './recipe.model';


@Injectable()
export class RecipeService {

    constructor() { }

    private getKey(name: string): string {
        return 'recipe.' + name;
    }

    saveRecipe(recipe: Recipe) {
        const id = this.getKey(recipe.name);
        localStorage.setItem(id, recipe.toJSON());
    }

    loadRecipe(name: string): Observable<Recipe> {
        const key = this.getKey(name);
        const recipe = new Recipe().fromJSON(localStorage.getItem(key));
        return Observable.of(recipe);
    }

    getRecipes(): Recipe[] {
        const recipes: Recipe[] = [];
        for (let i = 0, len = localStorage.length; i < len; ++i) {
            const key = localStorage.key(i);
            if (key.startsWith('recipe.')) {
                recipes.push(new Recipe().fromJSON(localStorage.getItem(key)))
            }
        }
        recipes.sort((a: Recipe, b: Recipe) => {
            return a.name.localeCompare(b.name);
        })
        return recipes;
    }

    clearAll() {
        localStorage.clear();
    }
}
