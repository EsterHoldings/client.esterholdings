import {BasicModuleInterface} from "~/composables/core/modules/module.interface";
import UsersService from "~/composables/core/modules/users/users.service";

export class UsersModule implements BasicModuleInterface {
    private usersService: UsersService;

    constructor() {
        this.usersService = new UsersService();
    }

    async get(params:object = {}) {
        return await this.usersService.get(params);
    }

    async getById(id:any): Promise<any> {
        return await this.usersService.getFirst(id);
    }

    async post(data:any): Promise<any> {
        return await this.usersService.post(data);
    }

    async put(data:object): Promise<any> {
        return await this.usersService.put(data);
    }

    async patch(data:object): Promise<any> {
        return await this.usersService.patch(data);
    }

    async delete(): Promise<any> {
        return await this.usersService.delete();
    }
}

export default UsersModule;
