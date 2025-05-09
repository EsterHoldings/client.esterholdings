import useApi from "~/composables/useApi";

export class PasswordService {

  private useApi:any;
  constructor() {
    this.useApi = new useApi(true);
  }
  async updatePassword(params: {}):Promise<any> {
    return await this.useApi.post("/update/password", params);
  }
}

export default PasswordService;