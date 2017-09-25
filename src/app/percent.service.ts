import { Injectable } from '@angular/core';
import { IFragment, TextFragment, VariableFragment, Pipe } from './percent.model';

@Injectable()
export class PercentService {

    token = '%';

    constructor(
        private data: any,
    ) { }

    public parse(template: string, dataObject: any): string {
        this.data = dataObject;
        const ast: IFragment[] = [];

        const matches = template.split(`/(${this.token}.+?${this.token})/`)
        for (const fragment of matches) {
            ast.push(this.determine(fragment));
        }
        let output = '';
        ast.forEach(fragment => {
            output += fragment.render();
        })
        return output;
    }

    private determine(fragment: string): IFragment {
        if (fragment.startsWith('%')) {
            return this.parseVariable(fragment);
        } else {
            return new TextFragment(fragment);
        }
    }

    private parseVariable(fragment: string): VariableFragment {
        fragment = fragment.replace(this.token, '');
        const pipes = fragment.split('|');
        const symbol = pipes[0];
        const variableFragment = new VariableFragment(symbol, this.resolve(symbol));
        pipes.forEach(function (pipe: string, i) {
            if (i > 0) {
                const parts = pipe.split(':');
                variableFragment.addPipe(new Pipe(parts[0], parts[1]))
            }
        });
        return variableFragment;
    }

    private resolve(variable: string): string {
        return this.data[variable];
    }
}