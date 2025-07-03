import useApi from "~/composables/useApi";

export class DocumentsService {

  private useApi:any;
  constructor() {
    this.useApi = new useApi(false);
  }
  async get(params: {}):Promise<any> {
    return await this.useApi.get("/admin/documents", params);
  }
  async getById(id:any) {
    return await this.useApi.get(`/admin/documents/${id}`);
  }

  async post(data:object = {}):Promise<any> {
    return await this.useApi.post("/admin/documents", data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.useApi.put(`/admin/documents/${id}`, data);
  }

  async patch(id:any, data:object = {}):Promise<any> {
    return await this.useApi.patch(`/admin/documents/${id}`, data);
  }

  async delete(id:any):Promise<any> {
    return await this.useApi.delete(`/admin/documents/${id}`);
  }
}

export default DocumentsService;