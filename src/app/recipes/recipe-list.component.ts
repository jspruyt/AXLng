import { Component, OnInit } from '@angular/core';

import { Recipe } from './recipe.model';
import { RecipeService } from './recipe.service';


@Component({
    selector: 'recipe-list',
    templateUrl: 'recipe-list.component.html'
})

export class RecipeListComponent implements OnInit {
    recipeList: Recipe[];

    constructor(
        private recipes: RecipeService,
    ) { }

    ngOnInit() {
        this.recipeList = this.recipes.getRecipes();
    }
}
