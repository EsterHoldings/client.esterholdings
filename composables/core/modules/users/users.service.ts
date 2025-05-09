import useApi from "~/composables/useApi";

export class UsersService {

  private useApi:any;
  constructor() {
    this.useApi = new useApi(true);
  }
  async get(params: {}):Promise<any> {
    return await this.useApi.get("/client/users", params);
  }
  async getFirst(id:any):Promise<any> {
    return await this.useApi.get(`/client/users/${id}`);
  }

  async post(data:object = {}):Promise<any> {
    return await this.useApi.post("/client/users", data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.useApi.put(`/client/users/${id}`, data);
  }

  async patch(data:object = {}):Promise<any> {
    return await this.useApi.post(`/client/profile/update`, data);
  }

  async delete():Promise<any> {
    return await this.useApi.delete(`/client/users`);
  }
}

export default UsersService;