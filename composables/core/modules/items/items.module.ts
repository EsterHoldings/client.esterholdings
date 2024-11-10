import ItemsService from "~/composables/core/modules/items/items.service";

export class ItemsModule implements BasicModuleInterface {
  private itemsService: ItemsService;
  constructor() {
    this.itemsService = new ItemsService();
  }

  get() {
    this.itemsService.get();
  }

  create() {
    this.itemsService.create();
  }

  update() {
    this.itemsService.update();
  }

  delete() {
    this.itemsService.delete();
  }
}

export default ItemsModule;
