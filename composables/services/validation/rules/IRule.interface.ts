interface IRule {
  passes(value: any, params: any): any;
  message(fieldName: any, params: any): any;
}
