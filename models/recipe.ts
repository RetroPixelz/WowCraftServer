import { prop, getModelForClass } from "@typegoose/typegoose";
import { Ingredient } from "./ingredient";

//create model class
export class Recipe {
    @prop({required: true})
    public title?: string;

    @prop({required: true})
    public description?: string;

    @prop({required: true})
    public image?: string;

    @prop({required: true})
    public amount?: number;

    //ingredients needed for crafting
    @prop({type: () => [Ingredient], required: true})
    public ingredients?: Ingredient[]
}

export const RecipeModel = getModelForClass(Recipe)