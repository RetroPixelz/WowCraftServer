import { prop, getModelForClass } from "@typegoose/typegoose";
import { IngredientThree } from "./ingredientThree";

//create model class
export class RecipeThree {
    @prop({required: true})
    public title?: string;

    @prop({required: true})
    public description?: string;

    @prop({required: true})
    public image?: string;

    @prop({required: true})
    public amount?: number;

    //ingredients needed for crafting
    @prop({type: () => [IngredientThree], required: true})
    public ingredients?: IngredientThree[]
}

export const RecipeThreeModel = getModelForClass(RecipeThree)