import { prop, getModelForClass } from "@typegoose/typegoose";
import { IngredientTwo } from "./ingredientTwo";

//create model class
export class RecipeTwo {
    @prop({required: true})
    public title?: string;

    @prop({required: true})
    public description?: string;

    @prop({required: true})
    public image?: string;

    @prop({required: true})
    public amount?: number;

    //ingredients needed for crafting
    @prop({type: () => [IngredientTwo], required: true})
    public ingredients?: IngredientTwo[]
}

export const RecipeTwoModel = getModelForClass(RecipeTwo)