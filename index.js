const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 3000;
const API_BASE_URL = "https://www.thecocktaildb.com/api/json/v1/1";

// Middleware configuration
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Helper function to extract ingredients & measures from API object
function formatRecipe(drink) {
  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];
    if (ingredient) {
      ingredients.push({
        name: ingredient,
        measure: measure ? measure.trim() : "To taste"
      });
    }
  }
  return {
    id: drink.idDrink,
    name: drink.strDrink,
    category: drink.strCategory,
    glass: drink.strGlass,
    instructions: drink.strInstructions,
    image: drink.strDrinkThumb,
    alcoholic: drink.strAlcoholic,
    ingredients
  };
}

// Route 1: Home Page (Search Form + Quick Actions)
app.get("/", (req, res) => {
  res.render("index", { drink: null, error: null });
});

// Route 2: Search by Name
app.post("/search", async (req, res) => {
  const searchQuery = req.body.drinkName?.trim();

  if (!searchQuery) {
    return res.render("index", {
      drink: null,
      error: "Please enter a cocktail name to search."
    });
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/search.php?s=${searchQuery}`);
    const drinks = response.data.drinks;

    if (!drinks) {
      return res.render("index", {
        drink: null,
        error: `No recipes found for "${searchQuery}". Please try another search!`
      });
    }

    const formattedDrink = formatRecipe(drinks[0]);
    res.render("index", { drink: formattedDrink, error: null });
  } catch (err) {
    console.error("API Fetch Error:", err.message);
    res.render("index", {
      drink: null,
      error: "Unable to retrieve recipe at this time. Please check your network and try again."
    });
  }
});

// Route 3: Get Random Cocktail
app.get("/random", async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/random.php`);
    const formattedDrink = formatRecipe(response.data.drinks[0]);
    res.render("index", { drink: formattedDrink, error: null });
  } catch (err) {
    console.error("Random Fetch Error:", err.message);
    res.render("index", {
      drink: null,
      error: "Failed to fetch a random cocktail. Please try again."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running smoothly on http://localhost:${PORT}`);
});