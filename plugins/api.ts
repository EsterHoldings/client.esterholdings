import { defineNuxtPlugin, useCookie, useNuxtApp, useRuntimeConfig } from "nuxt/app";
export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const resolveLocale = () => {
        const localeCookie = useCookie<string>("locale");
        const i18nRedirected = useCookie<string>("i18n_redirected");
        const nuxtApp = useNuxtApp();
        const i18n = (nuxtApp?.$i18n ?? null) as { locale?: string | { value: string } } | null;
        const i18nLocale =
            typeof i18n?.locale === "string" ? i18n.locale : i18n?.locale?.value;
        const resolved = i18nLocale || localeCookie.value || i18nRedirected.value;

        if (resolved && localeCookie.value !== resolved) {
            localeCookie.value = resolved;
        }

        return resolved;
    };

    const api = $fetch.create({
        // @ts-ignore
        baseURL: config.public.apiBase,
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        onRequest({ options }) {
            const locale = resolveLocale();
            if (locale) {
                options.headers = {
                    ...options.headers,
                    "X-Locale": locale,
                    "Accept-Language": locale,
                };
            }
        },
    })
    return { provide: { api } }
})
