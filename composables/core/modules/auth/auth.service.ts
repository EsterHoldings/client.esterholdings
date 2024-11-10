import ApiUtil from "~/utils/api/api.util";

export class AuthService {
  private apiUtil: any;

  constructor() {
    this.apiUtil = ApiUtil.getInstance();
  }

  async login(formData: Object): Promise<any> {
    return await this.apiUtil.post("/auth/login", formData);
  }

  async registration(formData: Object): Promise<any> {
    return await this.apiUtil.post("/auth/register", formData);
  }

  async logout(formData: Object): Promise<any> {
    return await this.apiUtil.post("/auth/logout");
  }
}

export default AuthService;
