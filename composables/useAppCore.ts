import AdminAuthModule from "~/composables/core/modules/adminAuth/adminAuth.module";
import AdminsModule from "~/composables/core/modules/admins/admins.module";
import AccountsModule from "~/composables/core/modules/accounts/accounts.module";
import AuthModule from "~/composables/core/modules/clients/auth.module";
import ItemsModule from "~/composables/core/modules/items/items.module";
import RolesModule from "~/composables/core/modules/roles/roles.module";
import PermissionsModule from "~/composables/core/modules/permissions/permissions.module";
import UsersModule from "~/composables/core/modules/users/users.module";
import HelperModule from "~/composables/core/modules/helper/helper.module";
import PasswordModule from "~/composables/core/modules/password/password.module";
import S3Module from "~/composables/core/modules/s3/s3.module";
import PaymentsModule from "~/composables/core/modules/payments/payments.module";
import DocumentsModule from "~/composables/core/modules/documents/documents.module";

export interface ICoreModules {
    adminAuth : AdminAuthModule;
    admins : AdminsModule;
    accounts : AccountsModule;
    auth: AuthModule;
    clients: AuthModule;
    documents: DocumentsModule;
    items: ItemsModule;
    roles: RolesModule;
    payments: PaymentsModule;
    permissions: PermissionsModule;
    users: UsersModule;
    helper: HelperModule;
    password: PasswordModule;
    s3: S3Module;
}

export const useAppCore = (): ICoreModules => {
    return {
        adminAuth: new AdminAuthModule(),
        admins: new AdminsModule(),
        accounts: new AccountsModule(),
        auth: new AuthModule(),
        clients: new AuthModule(), // TODO :: Fix
        documents: new DocumentsModule(),
        items: new ItemsModule(),
        roles: new RolesModule(),
        permissions: new PermissionsModule(),
        payments: new PaymentsModule(),
        users: new UsersModule(),
        helper: new HelperModule(),
        password: new PasswordModule(),
        s3: new S3Module(),
    };
};

export default useAppCore;
