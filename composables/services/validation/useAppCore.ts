import AuthModule from "~/composables/core/modules/auth/auth.module";
import ItemsModule from "~/composables/core/modules/items/items.module";
import {
  AuthModuleInterface,
  BasicModuleInterface,
} from "./core/modules/module.interface";

export interface CoreModules {
  auth: AuthModuleInterface;
  items: BasicModuleInterface;
}

export const useAppCore = (): CoreModules => {
  return {
    auth: new AuthModule(),
    items: new ItemsModule(),
  };
};

export default useAppCore;
