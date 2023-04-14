import { prop, Ref} from "@typegoose/typegoose";
import { InventoryTwo } from "./inventoryTwo";

//map what ingredient object needs
export class IngredientTwo {
    
   @prop({ref: InventoryTwo, required: true})
   public inventoryId?: Ref<InventoryTwo>

   @prop({required: true})
   public amountNeeded?: number
}

