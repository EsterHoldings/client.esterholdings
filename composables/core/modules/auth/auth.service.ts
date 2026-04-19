import useApi from "~/composables/useApi";
import { ROUTE_AUTH_LOGOUT, ROUTE_AUTH_REFRESH, ROUTE_AUTH_REGISTER, ROUTE_AUTH_USER } from "~/constants/routes";

export class AuthService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(true);
  }

  async login(formData: Object): Promise<any> {
    return await this.useApi.post("/auth/login", formData);
  }

  async registration(formData: Object): Promise<any> {
    return await this.useApi.post(ROUTE_AUTH_REGISTER, formData);
  }

  async logout(formData: Object): Promise<any> {
    return await this.useApi.post(ROUTE_AUTH_LOGOUT);
  }

  async authUser() {
    return await this.useApi.get(ROUTE_AUTH_USER);
  }

  async postSocialLogin(data: Object): Promise<any> {
    return await this.useApi.post("/auth/social", data);
  }

  async socialRedirect(provider: string, params: object = {}): Promise<any> {
    return await this.useApi.get(`/auth/social/${provider}/redirect`, params);
  }

  async checkIsAuth(): Promise<any> {
    return await this.useApi.get("/auth/isAuth");
  }

  async refresh(): Promise<any> {
    return await this.useApi.post(ROUTE_AUTH_REFRESH);
  }

  async verifyEmail(payload: { id: string; hash: string; expires: string; signature: string }): Promise<any> {
    const { id, hash, expires, signature } = payload;
    return await this.useApi.get(`/auth/verify-email/${id}/${hash}`, {
      expires,
      signature,
    });
  }

  async requestPasswordReset(payload: { email: string }): Promise<any> {
    return await this.useApi.post("/auth/password/forgot", payload);
  }

  async resetPassword(payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<any> {
    return await this.useApi.post("/auth/password/reset", payload);
  }
}

export default AuthService;
