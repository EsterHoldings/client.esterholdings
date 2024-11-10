import { Ref } from "vue";
import { defineStore } from "pinia";
import { getItem as getItemFromCookieStorage } from "~/utils/storage/cookie";
import {
  COOKIE_STORAGE__ACCESS_TOKEN,
  COOKIE_STORAGE__REFRESH_TOKEN,
} from "~/constans/storage";
import { TArray } from "ts-interface-checker";

export const useAuthStore: any = defineStore("auth", (): object => {
  const accessToken: Ref<string> = ref(
    getItemFromCookieStorage(COOKIE_STORAGE__ACCESS_TOKEN) || ""
  );
  const refreshToken: Ref<string> = ref(
    getItemFromCookieStorage(COOKIE_STORAGE__REFRESH_TOKEN) || ""
  );

  const isAuthenticated = computed(() => {
    return !!accessToken.value;
  });

  const setAccessToken = (value: string): void => {
    accessToken.value = value;
  };

  function setRefreshToken(value: string): void {
    refreshToken.value = value;
  }

  return {
    isAuthenticated,
    accessToken,
    refreshToken,
    setAccessToken,
    setRefreshToken,
  };
});
