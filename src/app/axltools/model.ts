import { ChildrenOutletContexts } from '@angular/router/src/router_outlet_context';

export class AxlResult {

    constructor(
        public successful: boolean,
        public operation: string,
        public message: string,
        public payload?: any
    ) { }
}

export class MultiArgument {

    public static fromArray(arr: any[]): MultiArgument[] {
        const length = arr.length;
        const argArr = [];
        arr.forEach(arg => {
            argArr.push(new MultiArgument(length, arg));
        })
        return argArr;
    }

    constructor(
        public length: number,
        public args: any,
    ) { }
}

export class SchemaAttribute {

    constructor(
        public key: string,
        public value: string,
    ) { }
}

export class SchemaNode {

    indent = '  ';

    constructor(
        public label: string,
        public value: string,
        public optional: boolean,
        public attributes: SchemaAttribute[],
        public children: SchemaNode[],
    ) { }

    public print(indentLevel: number = 0, printAttributes: boolean = true, sortOptional: boolean = true): string {
        let output = '';
        if (indentLevel !== 0) {
            output += '\n';
        }
        if (this.label === 'choice') {
            output += this.getIndent(indentLevel--) + '### beginchoice';
        } else {
            output += this.getIndent(indentLevel) + this.label + ': ' + this.value;
        }
        if (printAttributes) {
            this.attributes.forEach(attr => {
                output += ' #' + attr.key + ': ' + attr.value;
            });
        }
        if (sortOptional && (!this.optional)) {
            // print mandatory first
            this.children.forEach(child => {
                if (!child.optional) {
                    output += child.print(indentLevel + 1, printAttributes, sortOptional);
                }
            });

            // print optional
            let firstOptional = true;
            this.children.forEach(child => {
                if (child.optional) {
                    if (firstOptional) {
                        output += '\n';
                        output += this.getIndent(indentLevel + 1) + '### optional parameters #';
                        firstOptional = false;
                    }
                    output += child.print(indentLevel + 1, printAttributes, sortOptional);
                }
            });
        } else {
            this.children.forEach(child => {
                output += child.print(indentLevel + 1, printAttributes, sortOptional);
            });
        }
        if (this.label === 'choice') {
            output += '\n';
            output += this.getIndent(++indentLevel) + '### endchoice';
        }

        if (indentLevel === 0) {
            output += '\n';
        }
        return (output);
    }

    getIndent(indentLevel): string {
        let indent = '';
        for (let i = 0; i < indentLevel; i++) {
            indent += this.indent;
        }
        return indent;
    }
}

