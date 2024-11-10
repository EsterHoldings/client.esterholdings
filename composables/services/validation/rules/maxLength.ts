import { maxLength } from "../rules";

export class MaxLength implements IRule {
  passes(value: any, params: any) {
    return !maxLength(value, params.value);
  }
  message(fieldName: any, params: any = {}) {
    return `Field ${fieldName} length should be less than ${params?.value}!`;
  }
}

export default MaxLength;
