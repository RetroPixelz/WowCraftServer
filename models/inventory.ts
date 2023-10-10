import { prop, getModelForClass } from "@typegoose/typegoose";

//create model class
export class Inventory {
    @prop({required: true})
    public title?: string;

    @prop({required: true})
    public description?: string;

    @prop({required: true})
    public image?: string;

    @prop({required: true})
    public amount?: number;
    


}

export const InventoryModel = getModelForClass(Inventory)