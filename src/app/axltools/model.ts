
export class AxlResult {

    constructor(
        public successful: boolean,
        public operation: string,
        public message: string,
        public payload?: any
    ) {}
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

    constructor (
        public length: number,
        public args: any,
    ) {}
}

