import { Injectable } from '@angular/core';

import { IFragment, TextFragment, VariableFragment, Pipe } from './percent.model';

@Injectable()
export class PercentService {

    private token = '%';
    private data: any;

    constructor() {
        this.data = new Object();
    }

    public parse(template: string, dataObject: any): string {
        this.data = dataObject;
        const ast: IFragment[] = [];
        const reg = `(${this.token}.+?${this.token})`;
        // const reg = '%';
        const matches = template.split(new RegExp(reg));
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
        fragment = fragment.replace(new RegExp(this.token, 'g'), '').trim();
        const pipes = fragment.split('|');
        const symbol = pipes[0].trim();
        const variableFragment = new VariableFragment(symbol, this.resolve(symbol));
        pipes.forEach(function (pipe: string, i) {
            if (i > 0) {
                if (pipe.indexOf(':') !== -1) {
                    const parts = pipe.split(':');
                    variableFragment.addPipe(new Pipe(parts[0].trim(), parts[1].trim()));
                } else {
                    variableFragment.addPipe(new Pipe(pipe.trim()));
                }
            }
        });
        return variableFragment;
    }

    private resolve(variable: string): string {
        return this.data[variable];
    }
}