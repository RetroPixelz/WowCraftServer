import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';

//import models
import { ItemModel } from "./models/item";
import { InventoryModel } from "./models/inventory";
import { UserModal } from "./models/user";
import { Recipe, RecipeModel } from "./models/recipe";


dotenv.config();

const app: Express = express();

//middleware
app.use(cors()); // avoid CORS
app.use(express.json()); //get params from body



//Declare Vars
const port = process.env.PORT || 3000;
const clusterUrl = process.env.CLUSTER;
// establing MB connec

mongoose.set('strictQuery', false);

mongoose.connect(clusterUrl!).then(() => {
    console.log("MongoDB Connected Successfully...")
}).catch((error) => {
    console.log(error.message)
})


//endpoints
app.get("/", (req, res) => {
    res.send("server working")
})

//GET ALL RECIPES
app.get('/recipes', async (req, res) => {
    
//put all in if, if theres recipes do all of this, if not send error 404
    
    try {
        const recipes = await RecipeModel
        .find()
        .populate('ingredients.inventoryId')
        .exec()

        //check if there are enough ingredients to craft recipe, include boolean for each recipe
        //1. loop each recipe
        const recipesWithAvailability = await Promise.all(
            recipes.map(async (recipe) => {
            
                const ingredients = recipe.ingredients;
                let craftable = true;
    
                //2. loop trhrough each ingredient and check if enough in inventory
                for(const ingredient of ingredients!) {
                    //2.1. get inventory data for each ingredient
                    const inventory = await InventoryModel.findById(ingredient.inventoryId).exec();
                    //2.2. get the amount available from the inventory
                    const amount = inventory!.amount
    
                    // // //2.3. check if not enough
                    if(!amount || amount < ingredient.amountNeeded!){
                        craftable = false;
                        break;
                        //add another array for missing ingredients
                    }
                }
                //3. return recipe wioth the new craftable property
                return{...recipe.toObject(), craftable}
            })
        )
       

        //4. respond with new recipe data which includes craftable
        res.send(recipesWithAvailability)

    } catch (error) {
        console.log(error)
        res.status(400).json({error: "internal server error"})
    }

    
})


//craft recipe RECIPE
app.post('/recipes/craft', async (req, res) => {
    try {
        const { recipeId } = req.body;

        const recipe = await RecipeModel.findById(recipeId).exec();

        if(recipe) {
            recipe!.amount!++ //incrementing the recipe amount
            recipe!.save()

            //TODO: update inventory amount
            const ingredients = recipe.ingredients!
            for(const ingredient of ingredients){
                const inventoryId = ingredient.inventoryId
                const inventory = await InventoryModel.findById(inventoryId).exec()
                if(inventory){
                    inventory.amount! -= ingredient!.amountNeeded! //remove amount that was needed from amount had
                    await inventory.save()
                }
            }
        } 
        

        res.send({success: true})
    } catch (error) {
        console.log(error)
        res.status(500).send({error: error})
    }
})





//listener
app.listen(port, () => {
    console.log("[server]: server running at http://localhost:" + port)
})