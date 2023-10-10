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
import { Crafted } from "./models/Crafted";
import { CraftedDocument } from './models/crafted.interface';


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



//MAKE A POST TO USER PROFILE AND SHOW CRAFTED ITEMS THERE


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
        // Get username and password from the request body
        const { username, password } = req.body;

        // Find the user by username
        const user = await UserModal.findOne({ username: username });

        if (user) {
            // Check if the provided password matches the hashed password in the database
            const passwordMatch = await bcrypt.compare(password, user.password!);

            if (passwordMatch) {
                // Generate a JWT token here if needed

                // Return the user's ID along with success response
                res.json({ success: true, userId: user._id });
            } else {
                res.status(400).json({ error: "Invalid Password" });
            }
        } else {
            res.status(400).json({ error: "User does not exist" });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});

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


app.post('/recipe/craft', async (req, res) => {
    try {
        const { recipeId, userId } = req.body;

        const recipe = await RecipeModel.findById(recipeId).exec();
        const user = await UserModal.findById(userId).exec();

        console.log(user)

        if (!recipe) {
            return res.status(404).send({ error: "Recipe not found" });
        }

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        recipe.amount!++;
        await recipe.save();

        const ingredients = recipe.ingredients || [];
        for (const ingredient of ingredients) {
            const inventoryId = ingredient.inventoryId;
            const inventory = await InventoryModel.findById(inventoryId).exec();
            if (inventory) {
                inventory.amount! -= ingredient.amountNeeded || 0;
                await inventory.save();
            } else {
                console.log(`Inventory not found for ingredient: ${ingredient.inventoryId}`);
            }
        }

        // Create a new Crafted item and populate its properties from the recipe
        const craftedItem = new Crafted();
        craftedItem.title = recipe.title;
        craftedItem.description = recipe.description;
        craftedItem.image = recipe.image;
        craftedItem.amount = 1; // You can adjust the amount as needed

        if (user.craftedItems) {
            // Check if an item with the same title already exists
            const existingItem = user.craftedItems.find(item => item.title === craftedItem.title);

            if (existingItem) {
                // If it exists, increase its amount
                existingItem.amount!++;
                console.log(existingItem.amount)
            } else {
                // If it doesn't exist, add the new item to the array
                user.craftedItems.push(craftedItem);
            }

            await user.save();
        } else {
            console.log("User's craftedItems array not found");
        }

        res.send({ success: true });
    } catch (error) {
        console.error("Crafting error:", error);
        res.status(500).send({ error: "An error occurred while crafting" });
    }
});




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


app.post('/recipeTwo/craft', async (req, res) => {
    try {
        const { recipeId, userId } = req.body;

        const recipe = await RecipeTwoModel.findById(recipeId).exec();
        const user = await UserModal.findById(userId).exec();

        console.log(user)

        if (!recipe) {
            return res.status(404).send({ error: "Recipe not found" });
        }

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        recipe.amount!++;
        await recipe.save();

        const ingredients = recipe.ingredients || [];
        for (const ingredient of ingredients) {
            const inventoryId = ingredient.inventoryId;
            const inventory = await InventoryTwoModal.findById(inventoryId).exec();
            if (inventory) {
                inventory.amount! -= ingredient.amountNeeded || 0;
                await inventory.save();
            } else {
                console.log(`Inventory not found for ingredient: ${ingredient.inventoryId}`);
            }
        }

        // Create a new Crafted item and populate its properties from the recipe
        const craftedItem = new Crafted();
        craftedItem.title = recipe.title;
        craftedItem.description = recipe.description;
        craftedItem.image = recipe.image;
        craftedItem.amount = 1; // You can adjust the amount as needed

        if (user.craftedItems) {
            // Check if an item with the same title already exists
            const existingItem = user.craftedItems.find(item => item.title === craftedItem.title);

            if (existingItem) {
                // If it exists, increase its amount
                existingItem.amount!++;
                console.log(existingItem.amount)
            } else {
                // If it doesn't exist, add the new item to the array
                user.craftedItems.push(craftedItem);
            }

            await user.save();
        } else {
            console.log("User's craftedItems array not found");
        }

        res.send({ success: true });
    } catch (error) {
        console.error("Crafting error:", error);
        res.status(500).send({ error: "An error occurred while crafting" });
    }
});






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

app.post('/recipeThree/craft', async (req, res) => {
    try {
        const { recipeId, userId } = req.body;

        const recipe = await RecipeThreeModel.findById(recipeId).exec();
        const user = await UserModal.findById(userId).exec();

        console.log(user)

        if (!recipe) {
            return res.status(404).send({ error: "Recipe not found" });
        }

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        recipe.amount!++;
        await recipe.save();

        const ingredients = recipe.ingredients || [];
        for (const ingredient of ingredients) {
            const inventoryId = ingredient.inventoryId;
            const inventory = await InventoryThreeModel.findById(inventoryId).exec();
            if (inventory) {
                inventory.amount! -= ingredient.amountNeeded || 0;
                await inventory.save();
            } else {
                console.log(`Inventory not found for ingredient: ${ingredient.inventoryId}`);
            }
        }

        // Create a new Crafted item and populate its properties from the recipe
        const craftedItem = new Crafted();
        craftedItem.title = recipe.title;
        craftedItem.description = recipe.description;
        craftedItem.image = recipe.image;
        craftedItem.amount = 1; // You can adjust the amount as needed

        if (user.craftedItems) {
            // Check if an item with the same title already exists
            const existingItem = user.craftedItems.find(item => item.title === craftedItem.title);

            if (existingItem) {
                // If it exists, increase its amount
                existingItem.amount!++;
                console.log(existingItem.amount)
            } else {
                // If it doesn't exist, add the new item to the array
                user.craftedItems.push(craftedItem);
            }

            await user.save();
        } else {
            console.log("User's craftedItems array not found");
        }

        res.send({ success: true });
    } catch (error) {
        console.error("Crafting error:", error);
        res.status(500).send({ error: "An error occurred while crafting" });
    }
});


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


app.get("/user/:userId/craftedItems", async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModal.findById(userId).exec();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }

          const craftedItems = user.craftedItems || [];

    // Return the craftedItems as JSON response
         res.json(craftedItems);
    } catch (error) {
        console.error('Error fetching craftedItems:', error);
    res.status(500).json({ error: 'An error occurred while fetching craftedItems' });
    }
})



//listener
app.listen(port, () => {
    console.log("[server]: server running at http://localhost:" + port)
})
