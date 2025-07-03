import useApi from "~/composables/useApi";

export class PaymentSystemsService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(true);
  }

  async get(params: {}):Promise<any> {
    return await this.useApi.get("/client/payment-systems", params);
  }
  async getById(id:any) {
    return await this.useApi.get(`/client/payment-systems/${id}`);
  }

  async post(data:object = {}):Promise<any> {
    return await this.useApi.post("/client/payment-systems", data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.useApi.put(`/client/payment-systems/${id}`, data);
  }

  async patch(id:any, data:object = {}):Promise<any> {
    return await this.useApi.patch(`/client/payment-systems/${id}`, data);
  }

  async delete(id:any):Promise<any> {
    return await this.useApi.delete(`/client/payment-systems/${id}`);
  }
}

export default PaymentSystemsService;
