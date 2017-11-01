import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import 'brace/index';
import 'brace/theme/monokai';
import 'brace/mode/yamlx';
import 'brace/ext/language_tools.js';

import { Recipe } from './recipe.model';
import { RecipeService } from './recipe.service';

declare var ace: any;


@Component({
    selector: 'recipe',
    templateUrl: 'recipe.component.html'
})

export class RecipeComponent implements OnInit {
    @Input() recipeName: string;
    @Input() recipeDescription: string;
    recipeTemplate: string;
    aceOptions: any = { maxLines: 1000, printMargin: false, fontSize: '11pt' };
    // output: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private recipes: RecipeService,
    ) { }


    ngOnInit() {
        const name = this.route.snapshot.paramMap.get('name');
        console.log(name);
        if (name !== 'new') {
            this.recipes.loadRecipe(name)
            .subscribe(recipe => {
                this.recipeDescription = recipe.description;
                this.recipeName = recipe.name;
                this.recipeTemplate = recipe.template;
            })
        }
    }

    closeRecipe() {
        console.log('navigating to: /recipes')
        this.router.navigateByUrl('/recipes');
    }

    saveRecipe() {
        const recipe = new Recipe();
        recipe.name = this.recipeName;
        recipe.description = this.recipeDescription;
        recipe.template = this.recipeTemplate;
        this.recipes.saveRecipe(recipe);
    }

    listAll() {
        for (let i = 0, len = localStorage.length; i < len; ++i) {
            const key = localStorage.key(i);
            console.log(key + ':')
            console.log( localStorage.getItem( localStorage.key( i ) ) );
            // if (key.startsWith('recipe.')) {
            //     definitions.push(localStorage.key(i));
            // }
        }
    }

    clearAll() {
        this.recipes.clearAll();
    }







}
