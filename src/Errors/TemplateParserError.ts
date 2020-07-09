export default class TemplateParserError extends Error {
    constructor(scope: string, errorMessage: string) {
        super(errorMessage);
        this.name = TemplateParserError.name;
        this.message = `An error occured when parsing ${scope} : ${errorMessage} 🙊`;
    }
}
