import {BasicModuleInterface} from "../module.interface";
import PaymentSystemsService from "~/composables/core/modules/paymentSystems/paymentSystems.service";

interface ResponseDTO {
  success: Boolean;
  data: any;
  errors: any;
}

export class PaymentSystemsModule implements BasicModuleInterface {
  private paymentSystemService: PaymentSystemsService;

  constructor() {
    this.paymentSystemService = new PaymentSystemsService();
  }

  async get(params: {} = {}):Promise<any> {
    return await this.paymentSystemService.get(params);
  }
  async getById(id:any) {
    return await this.paymentSystemService.get(id);
  }

  async post(data:object = {}):Promise<any> {
    return await this.paymentSystemService.post(data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.paymentSystemService.put(id, data);
  }

  async patch(id:any, data:object = {}):Promise<any> {
    return await this.paymentSystemService.patch(id, data);
  }

  async delete(id:any):Promise<any> {
    return await this.paymentSystemService.delete(id);
  }


}

export default PaymentSystemsModule;
