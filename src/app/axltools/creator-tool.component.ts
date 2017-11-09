import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import * as yaml from 'js-yaml';
import * as csv from 'json-2-csv';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';


import { AxlService } from '../axltools/axl.service';
import { PercentService } from '../percent/percent.service';
import { RecipeService } from '../recipes/recipe.service';
import { Recipe, Step, Variable } from '../recipes/recipe.model';
import { YamlHelper } from '../utils/yaml.helper';
import { AxlResult, MultiArgument } from './model';

@Component({
    selector: 'creator-tool',
    templateUrl: 'creator-tool.component.html',
})

export class CreatorToolComponent implements OnInit {
    @Input() form: FormGroup;
    @Input() recipeName: string;
    @Input() isBulk: boolean;
    @Input() bulk: string;
    recipeList: Recipe[];
    recipe: Recipe;
    output: string;
    results: AxlResult[];
    errors: AxlResult[];
    bulkProgress = 0;
    stepProgress = 0;
    progressStarted = false;
    bulkIncrement: number;
    stepIncrement: number;
    stepIncrementOriginal: number;
    currentStep: string;


    constructor(
        private axl: AxlService,
        private percent: PercentService,
        private recipes: RecipeService,
    ) { }

    ngOnInit() {
        this.errors = [];
        this.results = [];
        this.recipeList = this.recipes.getRecipes();
        this.recipeName = '0';
    }

    onRecipeChange() {
        if (this.recipeName === '0') {
            this.form = null;
        } else {
            this.recipes.loadRecipe(this.recipeName)
                .subscribe(recipe => {
                    this.recipe = recipe;
                    this.generateForm();
                    this.resetProgress();
                })
        }
    }

    resetProgress() {
        this.stepProgress = 0;
        this.bulkProgress = 0;
    }

    progressBulk() {
        this.bulkProgress += this.bulkIncrement;
    }

    progressStep() {
        console.log('incrementing by: ' + this.stepIncrement);
        this.stepProgress += this.stepIncrement;
        this.stepIncrement = this.stepIncrementOriginal;
    }

    setStepIncrement(incr: number) {
        this.stepIncrement = incr;
        this.stepIncrementOriginal = incr;
    }

    overrideStepIncrement(incr: number) {
        this.stepIncrement = incr;
    }

    generateForm() {
        if (this.recipe !== null) {
            const group: any = {};
            group['bulk'] = new FormControl(this.recipe.variables
                .map(variable => variable.symbol)
                .concat(this.recipe.dependencies)
                .join(','));
            this.recipe.variables.forEach(variable => {
                group[variable.symbol] = new FormControl('');
            });
            this.recipe.dependencies.forEach(dependency => {
                group[dependency] = new FormControl('');
            })
            this.form = new FormGroup(group);
        }
    }

    onSubmit() {
        console.log('submitting: ' + JSON.stringify(this.form.value));
        if (this.axl.initialized) {
            this.resetProgress();
            this.progressStarted = true;
            this.create();
        } else {
            console.log('AXL client not initialized');
        }
    }

    create() {
        if (this.isBulk) {
            csv.csv2json(this.form.value['bulk'], (err, arr) => {
                if (err) {
                    console.log(err);
                } else {
                    this.bulkIncrement = 100 / arr.length;
                    arr.forEach(values => {
                        this.createRecipe(values)
                        .subscribe(success => {}, error => {}, () => {
                            this.progressBulk()
                        });
                    });
                }
            })
        } else {
            this.bulkIncrement = 100;
            // this.executeTemplate(this.form.value);
            this.createRecipe(this.form.value)
                .subscribe(success => {}, error => {}, () => {
                    this.progressBulk()
                });
        }
    }

    createRecipe(values: any): Observable<boolean> {
        return this.executeSteps(values)
            .map(result => {
                if (result.successful) {
                    this.results.push(result);
                } else {
                    this.errors.push(result);
                }
                this.currentStep = result.operation;
                this.progressStep();
                return true;
            })
            .catch((error: any) => {
                console.log('Something went terribly wrong:');
                console.log(error);
                return Observable.of(false);
            });
    }

    executeSteps(values: any): Observable<AxlResult> {
        console.log('executing: ' + JSON.stringify(values));
        const parsedRecipe = this.percent.parse(this.recipe.template, values);
        this.setStepIncrement(100 / this.recipe.steps.length);
        const documents = yaml.safeLoadAll(parsedRecipe, (doc) => { });
        let steps = Observable.from(documents).onErrorResumeNext();

        if (this.recipe.hasVarDefinition) {
            steps = steps.skip(1);
        }

        return steps
            .mergeMap((step: any) => {
                if (this.checkDependency(step, values)) {
                    return this.getArgs(step)
                        .mergeMap(multiArg => {
                            return this.axl.callOperation(step.operation, multiArg.args)
                                .map(result => {
                                    console.log(result.message);
                                    return result;
                                })
                                .catch((error: any) => {
                                    console.log('error on axl call operation:');
                                    console.log(error);
                                    return Observable.of(new AxlResult(false, step.operation, 'Operation failed', multiArg.args));
                                })
                                .do(() => {
                                    this.stepIncrementOriginal = this.stepIncrement;
                                    this.overrideStepIncrement(this.stepIncrement / multiArg.length);
                                });
                        });
                } else {
                    return Observable.of(new AxlResult(true, step.operation, 'skipped, dependency not met'));
                }
            })
            .catch((error: any) => {
                console.log('error on Step Execution:');
                console.log(error);
                return Observable.of(new AxlResult(false, this.recipe.name, 'error on step execution', values));
            });
    }

    checkDependency(step: any, values: any): boolean {
        let dependencyOK = true;
        if (step.hasOwnProperty('options') && step['options']) {
            if (step.options.hasOwnProperty('dependency') && step.options['dependency']) {
                if (!(values.hasOwnProperty(step.options.dependency) && values[step.options.dependency])) {
                    dependencyOK = false;
                }
            }
        }
        return dependencyOK;
    }


    getArgs(step: any): Observable<MultiArgument> {
        let multiple = false;
        if (step.hasOwnProperty('options') && step['options']) {
            if (step.options.hasOwnProperty('multiple')) {
                multiple = step.options.multiple;
            }
        }
        if (multiple) {
            return Observable.from(MultiArgument.fromArray(step.arguments));
        } else {
            return Observable.from(MultiArgument.fromArray([step.arguments]));
        }
    }


    testConnectionAxl() {
        const request = {
            searchCriteria: [{ name: '%' }],
            returnedTags: [{ name: '' }]
        };
        this.axl.callOperation('listProcessNode', request)
            .subscribe(result => {
                this.output = result.text();
            }, (errorMsg: string) => {
                this.output = errorMsg;
            })
    }

    onChange(code) {
        console.log(code);
    }



}
