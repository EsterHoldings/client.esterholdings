import useApi from "~/composables/useApi";

export class DocumentsService {

  private useApi:any;
  constructor() {
    this.useApi = new useApi(true);
  }
  async get(params: {}):Promise<any> {
    return await this.useApi.get("/client/documents", params);
  }
  async getById(id:any) {
    return await this.useApi.get(`/client/documents/${id}`);
  }

  async post(data:object = {}):Promise<any> {
    return await this.useApi.post("/client/documents", data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.useApi.put(`/client/documents/${id}`, data);
  }

  async patch(id:any, data:object = {}):Promise<any> {
    return await this.useApi.patch(`/client/documents/${id}`, data);
  }

  async delete(id:any):Promise<any> {
    return await this.useApi.delete(`/client/documents/${id}`);
  }
}

export default DocumentsService;