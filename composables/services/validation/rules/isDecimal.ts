import {isDecimal} from "../rules";

export class IsDecimal implements IRule {
    passes(value: any, params: any) {
        return isDecimal(value);
    }

    message(fieldName: any) {
        return `Field ${fieldName} is incorrect! (Example: 15.25)`;
    }
}

export default IsDecimal;
