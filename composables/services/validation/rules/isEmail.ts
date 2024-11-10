import { isEmail } from "../rules";

export class IsEmail implements IRule {
  passes(value: any, params: any) {
    return isEmail(value);
  }

  message(fieldName: any) {
    return `Field ${fieldName} is incorrect!`;
  }
}

export default IsEmail;
