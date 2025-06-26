import PasswordService from "~/composables/core/modules/password/password.service";

export class PasswordModule {
    private passwordService: PasswordService;

    constructor() {
        this.passwordService = new PasswordService();
    }

    async updatePassword(params:object = {}) {
        return await this.passwordService.updatePassword(params);
    }

    async resetPassword() {
        return await this.passwordService.resetPassword();
    }
}

export default PasswordModule;
