import { minLength } from "../rules";

export class MinLength implements IRule {
  passes(value: any, params: any = {}) {
    return !minLength(value, params.value);
  }
  message(fieldName: any, params: any = {}) {
    return `Field ${fieldName} length should be more than ${params?.value}!`;
  }
}

export default MinLength;
