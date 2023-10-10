import {prop, getModelForClass, Ref} from '@typegoose/typegoose';
import { Recipe } from './recipe';
import { Crafted } from './Crafted';


class User {
    
    @prop({required: true})
    public username?: string;

    @prop({required: true})
    public password?: string;

    @prop({required: true})
    public profession?: string;

    @prop({ type: () => [Crafted], required: true, default: [] }) // Initialize craftedItems as an empty array
    public craftedItems?: Crafted[];


}

export const UserModal = getModelForClass(User);