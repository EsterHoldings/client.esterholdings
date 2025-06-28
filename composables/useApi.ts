import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
import {useAdminAuthStore} from "~/stores/adminAuthStore";
import {useAuthStore} from "~/stores/authStore";


export class useApi {
    private api: AxiosInstance;

    constructor(forClient = false) {
        const {public: pub} = useRuntimeConfig()


        this.api = axios.create({
            // baseURL: "https://esterholdings.website/api/",
            baseURL: pub.baseApi,
            headers: {
                "Content-Type": "application/json",
            },
        });

        this.api.interceptors.request.use((config) => {
            const authStore = forClient ? useAuthStore() : useAdminAuthStore();
            let token = authStore.accessToken;

            // TODO :: Переделать все на стор
            if (forClient) token = localStorage.getItem("user_access_token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        });
    }

    request(config: AxiosRequestConfig): Promise<AxiosResponse> {
        return this.api.request(config);
    }

    get(url: string, params: object = {}): Promise<AxiosResponse> {
        return this.api.get(url, {params});
    }

    post(url: string, data?: object): Promise<AxiosResponse> {
        return this.api.post(url, data);
    }

    put(url: string, data?: object): Promise<AxiosResponse> {
        return this.api.put(url, data);
    }

    patch(url: string, data?: object): Promise<AxiosResponse> {
        return this.api.patch(url, data);
    }

    delete(url: string, params: object = {}): Promise<AxiosResponse> {
        return this.api.delete(url, {params});
    }
}

export default useApi;
