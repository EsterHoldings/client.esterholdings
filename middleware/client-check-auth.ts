import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";

export default defineNuxtRouteMiddleware((to, from) => {
    console.log('CHECK AUTH MIDDLEWARE');
});
