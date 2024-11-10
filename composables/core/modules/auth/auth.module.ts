import { T } from "untyped/dist/types-a20127ea";
import { useAuthStore } from "@/stores/authStore";
import { AuthModuleInterface } from "../module.interface";
import AuthService from "@/composables/core/modules/auth/auth.service";

import {
  COOKIE_STORAGE__ACCESS_TOKEN,
  COOKIE_STORAGE__REFRESH_TOKEN,
} from "@/constans/storage";
import {
  setItem as setItemToCookie,
  clearItem as clearItemToCookie,
} from "@/utils/storage/cookie";

interface ResponseDTO {
  success: Boolean;
  data: Array<T>;
  errors: Array<T>;
}

export class AuthModule implements AuthModuleInterface {
  private authService: AuthService;
  private authStore: any;

  constructor() {
    this.authStore = useAuthStore();
    this.authService = new AuthService();
  }

  getStore(): any {
    return this.authStore;
  }

  async doRegistration(formData: any) {
    await this.authService.registration(formData);
  }

  async doLogin(formData: any) {
    const response = await this.authService.login(formData);
    setItemToCookie(
      COOKIE_STORAGE__ACCESS_TOKEN,
      response.data.data.accessToken
    );
    this.authStore.setAccessToken(response.data.data.accessToken);
  }

  async doLogout() {
    // TODO :: Do logout on backend side
    clearItemToCookie(COOKIE_STORAGE__ACCESS_TOKEN);
    clearItemToCookie(COOKIE_STORAGE__REFRESH_TOKEN);
    this.authStore.setAccessToken("");
    this.authStore.setRefreshToken("");
  }
}

export default AuthModule;
