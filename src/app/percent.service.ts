import { Injectable } from '@angular/core';

@Injectable()
export class PercentService {

    startToken = '<%';
    endToken = '%>';
    
    constructor() { }


    // match with regex
    // split in fragments
    // loop over fragments
    //      determine type of fragment
    //          - variable
    //              - variable symbol
    //              - list of modifiers
    //          - basic fragment of text
    //              - text
    //      push new fragment on AST abstract syntax tree
    // traverse AST and render each fragment, add render to result
    // 

    public parse(template: string, dataObject: any): string {
        return '';

    }
}