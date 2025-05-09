import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import useAppCore from '~/composables/useAppCore';
import { navigateTo } from 'nuxt/app';
import { ROUTE_ADMIN_AUTH_LOGIN } from '~/constants/routes';

export const useAuthStore = defineStore('userAuth', () => {

  const accessToken = ref<string>('');
  const refreshToken = ref<string>('');

  const user = ref<any>(null);
  const photoUrl = ref<string>('');

  if (process.client) {
    const storedAccessToken = localStorage.getItem('user_access_token');
    const storedRefreshToken = localStorage.getItem('user_refresh_token');

    if (storedAccessToken) {
      accessToken.value = storedAccessToken;
    }
    if (storedRefreshToken) {
      refreshToken.value = storedRefreshToken;
    }
  }

  const isAuthenticated = computed<boolean>(() => {
    return accessToken.value !== '';
  });

  watch(accessToken, (newValue: string) => {
    if (process.client) {
      localStorage.setItem('user_access_token', newValue);
    }
  });
  watch(refreshToken, (newValue: string) => {
    if (process.client) {
      localStorage.setItem('user_refresh_token', newValue);
    }
  });

  function setAccessToken(value: string): void {
    accessToken.value = value;
  }
  function setRefreshToken(value: string): void {
    refreshToken.value = value;
  }

  function setUser(userData: any): void {
    user.value = userData;
    photoUrl.value = userData.photo_url || '';
  }

  function setPhotoUrl(url: string): void {
    photoUrl.value = url;
  }

  async function initAuth(): Promise<void> {
    if (!process.client) {
      return;
    }
    if (!accessToken.value) {
      return;
    }

    const appCore = useAppCore();
    try {
      const response = await appCore.auth.getAuthUser();
      setUser(response.data);
    } catch (error) {
      // Якщо токен недійсний — логаут
      await authLogout();
    }
  }

  // Вихід (очищуємо токени, стан і повертаємо на сторінку логіну)
  async function authLogout(): Promise<void> {
    setAccessToken('');
    setRefreshToken('');
    user.value = null;
    photoUrl.value = '';
    if (process.client) {
      localStorage.removeItem('user_access_token');
      localStorage.removeItem('user_refresh_token');
    }
    navigateTo(ROUTE_ADMIN_AUTH_LOGIN);
  }

  return {
    accessToken,
    refreshToken,
    user,
    photoUrl,
    isAuthenticated,
    setAccessToken,
    setRefreshToken,
    setUser,
    setPhotoUrl,
    initAuth,
    authLogout,
  };
});
