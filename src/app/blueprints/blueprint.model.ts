import * as yaml from 'js-yaml';

import { PercentService } from '../percent/percent.service';
import { YamlHelper } from '../utils/yaml.helper';

export class Blueprint {

    public name: string;
    public description: string;
    public template: string;
    public steps: Step[];
    public variables: Variable[];
    public dependencies: string[];
    public hasVarDefinition: boolean;

    private percent: PercentService;
    private templateDocuments: string[];

    constructor(
        name?: string,
        description?: string,
        template?: string,
    ) {
        this.percent = new PercentService();
        this.name = name;
        this.description = description;
        this.template = template;
        this.variables = [];
        this.steps = [];
        this.dependencies = [];
        this.templateDocuments = [];
        this.hasVarDefinition = false;
        if (template) {
            this.loadTemplate();
        }
    }

    fromJSON(json: string): Blueprint {
        const obj = JSON.parse(json);
        this.name = obj.name;
        this.description = obj.description;
        this.template = obj.template;
        this.loadTemplate();
        return this;
    }

    toJSON(): string {
        const jsonBlueprint = new JsonBlueprint(this.name, this.description, this.template);
        return JSON.stringify(jsonBlueprint);
    }

    validate(): boolean {
        console.log('validating blueprint');
        try {
            const voidTemplate = this.percent.parseVoid(this.template);
            yaml.safeLoadAll(voidTemplate, doc => {});
        } catch (error) {
            console.log('blueprint not valid:');
            console.log(error);
            return false;
        }
        console.log('blueprint valid')
        return true;
    }

    private loadTemplate() {
        this.templateDocuments = YamlHelper.splitDocuments(this.template);
        this.loadVariables();
        this.loadSteps();
    }

    private loadSteps() {
        this.templateDocuments.forEach(template => {
            const voidTemplate = this.percent.parseVoid(template);
            const yamlObject = yaml.safeLoad(voidTemplate);
            const step = this.makeStep(yamlObject);
            if (step) {
                this.steps.push(step);
            }
        })
    }

    private makeStep(yamlObject: any): Step {
        let validObject = yamlObject.hasOwnProperty('operation') && yamlObject['operation'];
        validObject = validObject && yamlObject.hasOwnProperty('arguments') && yamlObject['arguments']

        if (validObject) {
            const operation = yamlObject.operation;
            const args: any = yamlObject.arguments;
            let options: any = {};
            if (yamlObject.hasOwnProperty('options') && yamlObject['options']) {
                options = yamlObject['options'];
                this.addDependencies(options);
            }
            return new Step(operation, args, options);
        } else {
            return null;
        }
    }

    private addDependencies(options: any) {
        if (options.hasOwnProperty('dependency') && options['dependency']) {
            let dep = options['dependency'] as string;
            if (dep.startsWith('!')) {
                dep = dep.substr(1);
            }
            if (!this.dependencies.includes(dep)) {
                this.dependencies.push(dep);
            }
        }
    }

    private loadVariables() {
        // create variables object from first doc
        const variablesObject = yaml.safeLoad(this.templateDocuments[0]);
        this.hasVarDefinition = !!(variablesObject.hasOwnProperty('variables') && variablesObject['variables']);

        // get variables from template
        const variablesList = this.percent.listVariables(this.template);

        // match variables from template with variable definition document
        variablesList.forEach(variable => {
            let foundMatch = false;
            if (this.hasVarDefinition) {
                // find a defintion for the variable from the template
                for (const varDef of variablesObject.variables) {
                    if (varDef.symbol === variable) {
                        foundMatch = true;
                        this.variables.push(new Variable(varDef.symbol, varDef.label));
                        break;
                    }
                }
                if (!foundMatch) {
                    this.variables.push(new Variable(variable, ''));
                }
            } else {
                this.variables.push(new Variable(variable, ''));
            }
        });
    }
}

export class Step {
    constructor(
        public operation: string,
        public args?: any[],
        public options?: any,
    ) { }
}

export class Variable {
    constructor(
        public symbol: string,
        public label: string,
    ) { }
}

export class JsonBlueprint {
    constructor(
        public name: string,
        public description: string,
        public template: string,
    ) { }
}


