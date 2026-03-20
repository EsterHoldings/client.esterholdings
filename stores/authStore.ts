import useAppCore from "~/composables/useAppCore";
import { ROUTE_AUTH_LOGIN } from "~/constants/routes";
import { defineStore } from "pinia";
import { navigateTo } from "nuxt/app";
import { ref, computed, watch } from "vue";
import { USER_ACCESS_TOKEN } from "~/constants/auth";

export const useAuthStore = defineStore("userAuth", () => {
    const accessToken = ref<string>("");
    const user = ref<any>(null);
    const photoUrl = ref<string>("");
    const isUserLoaded = ref<boolean>(false);
    let initAuthPromise: Promise<void> | null = null;
    let loadedForToken = "";

    if (process.client) {
        const storedAccessToken = localStorage.getItem(USER_ACCESS_TOKEN);

        if (storedAccessToken) {
            accessToken.value = storedAccessToken;
        }
    }

    const isAuthenticated = computed<boolean>(() => {
        return accessToken.value !== "";
    });

    function resetUserState(): void {
        user.value = null;
        photoUrl.value = "";
        isUserLoaded.value = false;
        loadedForToken = "";
    }

    watch(accessToken, (newValue: string) => {
        if (!process.client) {
            return;
        }

        if (newValue) {
            localStorage.setItem(USER_ACCESS_TOKEN, newValue);
            return;
        }

        localStorage.removeItem(USER_ACCESS_TOKEN);
    });

    function setAccessToken(value: string): void {
        const previousToken = accessToken.value.trim();
        const nextToken = value.trim();

        if (process.client) {
            if (nextToken) {
                localStorage.setItem(USER_ACCESS_TOKEN, nextToken);
            } else {
                localStorage.removeItem(USER_ACCESS_TOKEN);
            }
        }

        if (previousToken !== nextToken) {
            resetUserState();
        }

        accessToken.value = value;
    }

    function setUser(userData: any): void {
        if (!userData || typeof userData !== "object") {
            resetUserState();
            return;
        }

        user.value = userData;
        photoUrl.value = userData.photo_url || "";
        isUserLoaded.value = true;
        loadedForToken = accessToken.value.trim();
    }

    function setPhotoUrl(url: string): void {
        photoUrl.value = url;
    }

    async function initAuth(force = false): Promise<void> {
        if (!process.client) {
            return;
        }

        const normalizedToken = accessToken.value.trim();
        if (!normalizedToken) {
            resetUserState();
            return;
        }

        if (!force && isUserLoaded.value && loadedForToken === normalizedToken && user.value) {
            return;
        }

        if (initAuthPromise) {
            return await initAuthPromise;
        }

        const appCore = useAppCore();
        initAuthPromise = (async () => {
            const response = await appCore.auth.getAuthUser();
            setUser(response.data);
        })();

        try {
            await initAuthPromise;
        } finally {
            initAuthPromise = null;
        }
    }

    async function authLogout(): Promise<void> {
        setAccessToken("");
        resetUserState();
        navigateTo(ROUTE_AUTH_LOGIN);
    }

    return {
        accessToken,
        authLogout,
        initAuth,
        isUserLoaded,
        isAuthenticated,
        photoUrl,
        setAccessToken,
        setPhotoUrl,
        setUser,
        user,
    };
});
