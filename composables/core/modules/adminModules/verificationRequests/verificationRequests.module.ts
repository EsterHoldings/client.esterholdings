import { useAuthStore } from "@/stores/authStore";
import ClientsService from "~/composables/core/modules/adminModules/clients/clients.service";
import VerificationRequestsService
  from "~/composables/core/modules/adminModules/verificationRequests/verificationRequests.service";

interface ResponseDTO {
  success: Boolean;
  data: any;
  errors: any;
}

export class VerificationRequestsModule {
  private verificationRequestsService: VerificationRequestsService;

  constructor() {
    this.verificationRequestsService = new VerificationRequestsService();
  }

  async get(clientId) {
    return await this.verificationRequestsService.get(clientId);
  }

  async getById(id:any): Promise<any> {
    return await this.verificationRequestsService.getById(id);
  }

  async post(data:any): Promise<any> {
    return await this.verificationRequestsService.post(data);
  }

  async put(id:any, data:object): Promise<any> {
    return await this.verificationRequestsService.put(id, data);
  }

  async patch(id:any, data:object): Promise<any> {
    return await this.verificationRequestsService.patch(id, data);
  }

  async delete(id:any): Promise<any> {
    return await this.verificationRequestsService.delete(id);
  }
}

export default VerificationRequestsModule;
