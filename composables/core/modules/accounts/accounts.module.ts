import { BasicModuleInterface } from "../module.interface";
import AccountsService from "~/composables/core/modules/accounts/accounts.service";

interface ResponseDTO {
  success: Boolean;
  data: any;
  errors: any;
}

export class AccountsModule implements BasicModuleInterface {
  private accountsService: AccountsService;

  constructor() {
    this.accountsService = new AccountsService();
  }

  async get(params: {} = {}): Promise<any> {
    return await this.accountsService.get(params);
  }
  async getById(id: any) {
    return await this.accountsService.getById(id);
  }

  async post(data: object = {}): Promise<any> {
    return await this.accountsService.post(data);
  }

  async put(id: any, data: object = {}): Promise<any> {
    return await this.accountsService.put(id, data);
  }

  async patch(id: any, data: object = {}): Promise<any> {
    return await this.accountsService.patch(id, data);
  }

  async delete(id: any): Promise<any> {
    return await this.accountsService.delete(id);
  }

  async toggleFavorite(id: any): Promise<any> {
    return await this.accountsService.toggleFavorite(id);
  }

  async refreshBalance(id: any): Promise<any> {
    return await this.accountsService.refreshBalance(id);
  }

  async refreshAllBalances(): Promise<any> {
    return await this.accountsService.refreshAllBalances();
  }

  async getTradeHistory(id: any, params: object = {}): Promise<any> {
    return await this.accountsService.getTradeHistory(id, params);
  }

  async syncTradeHistory(id: any, data: object = {}): Promise<any> {
    return await this.accountsService.syncTradeHistory(id, data);
  }

  async transfer(data: object = {}): Promise<any> {
    return await this.accountsService.transfer(data);
  }
}

export default AccountsModule;
