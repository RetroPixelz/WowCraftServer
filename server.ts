import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';

//import models
import { ItemModel } from "./models/item";
import { Inventory, InventoryModel } from "./models/inventory";
import { UserModal } from "./models/user";
import { Recipe, RecipeModel } from "./models/recipe";
import { InventoryTwo, InventoryTwoModal } from "./models/inventoryTwo";
import { InventoryThreeModel } from "./models/inventoryThree";
import { RecipeTwoModel } from "./models/recipeTwo";
import { RecipeThreeModel } from "./models/recipeThree";


dotenv.config();

const app: Express = express();

//middleware
app.use(cors());
app.use(express.json()); 



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



//SIGNUP
app.post("/user/signup", async (req, res) => {
    try {
        let {username, password, profession } = req.body
        //hash pass
        password = await bcrypt.hash(password, 10)
        //create user
        const user = await UserModal.create({username, password, profession})
        res.json(user)

    } catch (error) {
        res.status(400).json({error});
    }

})

//LOGIN
app.post("/user/login", async (req, res) => {
    try {
        //get var
        let {username, password} = req.body
        //does user exist
        const user = await UserModal.findOne({username: username})
        if(user) {
            //check pass match if exist
            const result = await bcrypt.compare(password, user.password!);
            if (result) {
                //JWT token
                res.json({success: true})
            } else {
                res.status(400).json({error: "Invalid Password"});
            }
        } else {
            res.status(400).json({error: "User does not exist"});
        }
    } catch (error) {
        res.status(400).json({error});
    }
})
//AUTH





//RECIPE ONE
app.get('/recipe', async (req, res) => {
    
    try {
        const recipes = await RecipeModel
        .find()
        .populate('ingredients.inventoryId')
        .exec()

        
        const recipesWithAvailability = await Promise.all(
            recipes.map(async (recipe) => {
            
                const ingredients = recipe.ingredients;
                let craftable = true;
    
                for(const ingredient of ingredients!) {
                    const inventory = await InventoryModel.findById(ingredient.inventoryId).exec();
                    const amount = inventory!.amount
                    if(!amount || amount < ingredient.amountNeeded!){
                        craftable = false;
                        break;
                      
                    }
                }
              
                return{...recipe.toObject(), craftable}
            })
        )
       
        res.send(recipesWithAvailability)
    } catch (error) {
        console.log(error)
        res.status(400).json({error: "internal server error"})
    }
})

//craft recipe RECIPE
app.post('/recipe/craft', async (req, res) => {
    try {
        const { recipeId } = req.body;

        const recipe = await RecipeModel.findById(recipeId).exec();

        if(recipe) {
            recipe!.amount!++ 
            recipe!.save()

            const ingredients = recipe.ingredients!
            for(const ingredient of ingredients){
                const inventoryId = ingredient.inventoryId
                const inventory = await InventoryModel.findById(inventoryId).exec()
                if(inventory){
                    inventory.amount! -= ingredient!.amountNeeded! 
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
//RECIPE ONE





//RECIPE TWO
app.get('/recipeTwo', async (req, res) => {
    try {
        const recipes = await RecipeTwoModel
        .find()
        .populate('ingredients.inventoryId')
        .exec()

        const recipesWithAvailability = await Promise.all(
            recipes.map(async (recipe) => {
            
                const ingredients = recipe.ingredients;
                let craftable = true;
                for(const ingredient of ingredients!) {
                    const inventory = await InventoryTwoModal.findById(ingredient.inventoryId).exec();
                    const amount = inventory!.amount

                    if(!amount || amount < ingredient.amountNeeded!){
                        craftable = false;
                        break;
                    }
                }
                return{...recipe.toObject(), craftable}
            })
        )

        res.send(recipesWithAvailability)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "internal server error"})
    }
})

//craft recipe RECIPE
app.post('/recipeTwo/craft', async (req, res) => {
    try {
        const { recipeId } = req.body;

        const recipe = await RecipeTwoModel.findById(recipeId).exec();

        if(recipe) {
            recipe!.amount!++ 
            recipe!.save()

            const ingredients = recipe.ingredients!
            for(const ingredient of ingredients){
                const inventoryId = ingredient.inventoryId
                const inventory = await InventoryTwoModal.findById(inventoryId).exec()
                if(inventory){
                    inventory.amount! -= ingredient!.amountNeeded! 
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
//RECIPE TWO





//RECIPE THREE
app.get('/recipeThree', async (req, res) => {
    
    try {
        const recipes = await RecipeThreeModel
        .find()
        .populate('ingredients.inventoryId')
        .exec()

        const recipesWithAvailability = await Promise.all(
            recipes.map(async (recipe) => {
            
                const ingredients = recipe.ingredients;
                let craftable = true;

                for(const ingredient of ingredients!) {
                    const inventory = await InventoryThreeModel.findById(ingredient.inventoryId).exec();
                    const amount = inventory!.amount

                    if(!amount || amount < ingredient.amountNeeded!){
                        craftable = false;
                        break;

                    }
                }

                return{...recipe.toObject(), craftable}
            })
        )

        res.send(recipesWithAvailability)
    } catch (error) {
        console.log(error)
        res.status(400).json({error: "internal server error"})
    }
})

//craft recipe RECIPE
app.post('/recipeThree/craft', async (req, res) => {
    try {
        const { recipeId } = req.body;

        const recipe = await RecipeThreeModel.findById(recipeId).exec();

        if(recipe) {
            recipe!.amount!++ 
            recipe!.save()

            const ingredients = recipe.ingredients!
            for(const ingredient of ingredients){
                const inventoryId = ingredient.inventoryId
                const inventory = await InventoryThreeModel.findById(inventoryId).exec()
                if(inventory){
                    inventory.amount! -= ingredient!.amountNeeded! 
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
//RECIPE THREE















//INVENTORY ONE
app.get("/inventory", async (req, res) => {
    const inventory = await InventoryModel.find({})
    res.send(inventory)
})


app.post("/inventory", async (req, res) => {
    const {title, description, image, amount} = req.body;
    const inventory = await InventoryModel.create({title, description, image, amount});
    res.send(inventory)

})


app.put("/inventory/:id", async (req, res) =>{
    const { id } = req.params;
    const {amount} = req.body;

    const inventory = await InventoryModel.findByIdAndUpdate(id, {amount},  {new: true});

    res.send(inventory)
})


app.delete("/inventory/:id", async (req, res) => {
    const { id } = req.params;

    const inventory = await InventoryModel.findByIdAndDelete(id);

    res.send(inventory)
})
//INVENTORY ONE




//INVENTORY TWO
app.get("/inventoryTwo", async (req, res) => {
    const inventory = await InventoryTwoModal.find({})
    res.send(inventory)
})


app.post("/inventoryTwo", async (req, res) => {
    const {title, description, image, amount} = req.body;
    const inventory = await InventoryTwoModal.create({title, description, image, amount});
    res.send(inventory)

})


app.put("/inventoryTwo/:id", async (req, res) =>{
    const { id } = req.params;
    const {amount} = req.body;
    const {image} = req.body;

    const inventory = await InventoryTwoModal.findByIdAndUpdate(id, {amount, image},  {new: true});

    res.send(inventory)
})


app.delete("/inventoryTwo/:id", async (req, res) => {
    const { id } = req.params;

    const inventory = await InventoryTwoModal.findByIdAndDelete(id);

    res.send(inventory)
})
//INVENTORY TWO






//INVENTORY THREE
app.get("/inventoryThree", async (req, res) => {
    const inventory = await InventoryThreeModel.find({})
    res.send(inventory)
})


app.post("/inventoryThree", async (req, res) => {
    const {title, description, image, amount} = req.body;
    const inventory = await InventoryThreeModel.create({title, description, image, amount});
    res.send(inventory)
})


app.put("/inventoryThree/:id", async (req, res) =>{
    const { id } = req.params;
    const {amount} = req.body;
    const {image} = req.body;
    
    const inventory = await InventoryThreeModel.findByIdAndUpdate(id, {amount, image},  {new: true});

    res.send(inventory)
})


app.delete("/inventoryThree/:id", async (req, res) => {
    const { id } = req.params;

    const inventory = await InventoryThreeModel.findByIdAndDelete(id);

    res.send(inventory)
})
//INVENTORY THREE




//listener
app.listen(port, () => {
    console.log("[server]: server running at http://localhost:" + port)
})