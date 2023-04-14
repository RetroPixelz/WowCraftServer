import { prop, Ref} from "@typegoose/typegoose";
import { Inventory } from "./inventory";

//map what ingredient object needs
export class Ingredient {
    
   @prop({ref: Inventory, required: true})
   public inventoryId?: Ref<Inventory>

   @prop({required: true})
   public amountNeeded?: number
}

