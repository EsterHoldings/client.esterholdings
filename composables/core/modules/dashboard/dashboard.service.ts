import useApi from "~/composables/useApi";

export class DashboardService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(true);
  }

  async summary(): Promise<any> {
    return await this.useApi.get("/client/dashboard/summary", {});
  }
}

export default DashboardService;
