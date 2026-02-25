import DashboardService from "~/composables/core/modules/dashboard/dashboard.service";

export class DashboardModule {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  async getSummary(): Promise<any> {
    return await this.dashboardService.summary();
  }
}

export default DashboardModule;
