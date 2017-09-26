export interface IFragment {

    render(): string;

}

export class Pipe {

    constructor(
        private pipe: string = '',
        private parameter: string = ''
    ) {}

    public apply(input) {
        return this[this.pipe](input, this.parameter);
    }

    private upper(input: string, parameter: string) {
        return input.toUpperCase();
    }

    private lower(input: string, parameter: string) {
        return input.toLowerCase();
    }

    private ascii(input: string, parameter: string) {
        return input;
    }

    private left(input: string, parameter: string) {
        const parameterNumber = Number(parameter);
        if (!isNaN(parameterNumber)) {
            if (parameterNumber === 0) {
                return input;
            } else if (parameterNumber > 0) {
                return input.substring(0, parameterNumber);
            } else {
                return input.substring(-parameterNumber, input.length);
            }
        } else {
            return input;
        }
    }

    private right(input: string, parameter: string) {
        const parameterNumber = Number(parameter);
        if (!isNaN(parameterNumber)) {
            if (parameterNumber === 0) {
                return input;
            } else if (parameterNumber > 0) {
                return input.substring(input.length - parameterNumber, input.length);
            } else {
                return input.substring(0, input.length + parameterNumber);
            }
        } else {
            return input;
        }
    }

}

export class TextFragment implements IFragment {
    constructor (
        private text: string = '',
    ) {}

    public render() {
        return this.text;
    }

}

export class VariableFragment implements IFragment {

    constructor (
        private variable: string = '',
        private value: string = '',
        private pipes: Pipe[] = []
    ) {}

    public render() {
        let render: string = this.value;
        for (const pipe of this.pipes) {
            render = pipe.apply(render);
        }
        return render;
    }

    public addPipe(pipe: Pipe) {
        this.pipes.push(pipe);
    }

}

