export class IsRequired implements IRule {
  passes(value: any, params: any) {
    return !!value;
  }

  message(fieldName: any) {
    return `Field ${fieldName} is required!`;
  }
}

export default IsRequired;
