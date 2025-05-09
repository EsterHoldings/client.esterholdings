import {BasicModuleInterface} from "~/composables/core/modules/module.interface";
import HelperService from "~/composables/core/modules/helper/helper.service";
import PasswordService from "~/composables/core/modules/password/password.service";

export class PasswordModule {
    private passwordService: PasswordService;

    constructor() {
        this.passwordService = new PasswordService();
    }

    async updatePasssword(params:object = {}) {
        return await this.passwordService.updatePassword(params);
    }
}

export default PasswordModule;
