interface IFragment {

    render(): string;

}

export class Pipe {

    constructor(
        private pipe: string,
        private parameter: string
    ) {}

    public apply(input) {
        return this[this.pipe](input, this.parameter);
    }

    private upperCase(input: string, parameter: string) {
        return input.toUpperCase();
    }


}


export class TextFragment implements IFragment {
    constructor (
        private text: string,
    ) {}

    public render() {
        return this.text;
    }

}

export class VariableFragment implements IFragment {


    constructor (
        private variable: string,
        private value: string,
        private pipes: Pipe[]
    ) {}

    public render() {
        return '';
    }

    public addPipe(pipe: Pipe) {
        this.pipes.push(pipe);
    }

}

