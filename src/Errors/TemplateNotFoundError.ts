export default class TemplateNotFoundError extends Error {
    constructor(templateName: string) {
        super(templateName);
        this.name = TemplateNotFoundError.name;
        this.message = `Sorry but the ${templateName} template file could not be found 🕵🏻‍♂️`;
    }
}
