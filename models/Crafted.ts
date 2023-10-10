import { prop } from "@typegoose/typegoose";

export class Crafted {

   @prop({required: true})
   public title?: string;

   @prop({required: true})
   public description?: string;

   @prop({required: true})
   public image?: string;

   @prop({required: true})
   public amount?: number;

   
//    constructor(title: string, description: string, image: string, amount: number) {
//       this.title = title;
//       this.description = description;
//       this.image = image;
//       this.amount = amount;
//   }

}

