export default class CancelEditionError extends Error {
    constructor() {
        super(CancelEditionError.name);
        this.name = CancelEditionError.name;
    }
}
