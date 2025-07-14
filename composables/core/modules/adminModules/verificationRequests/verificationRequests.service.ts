import useApi from "~/composables/useApi";

export class VerificationRequestsService {
    private useApi: any;

    constructor() {
        this.useApi = new useApi(false);
    }

    async get(clientId: string): Promise<any> {
        return await this.useApi.get(`/admin/verification-requests?client_id=${clientId}`);
    }

    async getById(id: any) {
        return await this.useApi.get(`/admin/verification-requests/${id}`);
    }

    async getAll(payload: any = {}): Promise<any> {
        return await this.useApi.get(`/admin/verification-requests/all`, payload);
    }

    async post(data: object = {}): Promise<any> {
        return await this.useApi.post("/admin/verification-requests", data);
    }

    async put(id: any, data: object = {}): Promise<any> {
        return await this.useApi.put(`/admin/verification-requests/${id}`, data);
    }

    async patch(id: any, data: object = {}): Promise<any> {
        return await this.useApi.patch(`/admin/verification-requests/${id}`, data);
    }

    async delete(id: any): Promise<any> {
        return await this.useApi.delete(`/admin/clients/${id}`);
    }
}

export default VerificationRequestsService;
