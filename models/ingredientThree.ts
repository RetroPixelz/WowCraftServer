import { prop, Ref} from "@typegoose/typegoose";
import { InventoryThree } from "./inventoryThree";

//map what ingredient object needs
export class IngredientThree {
    
   @prop({ref: InventoryThree, required: true})
   public inventoryId?: Ref<InventoryThree>

   @prop({required: true})
   public amountNeeded?: number
}

