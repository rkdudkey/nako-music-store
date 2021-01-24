const express = require('express');
const router = express.Router();
const fs = require("fs");
const session = require("express-session");

// Set the user session
router.use(
  session({
    secret: "doglovecat",
    resave: false,
    saveUninitialized: true
  })
);


//append images and price
let guitarStock = new Array();
let shoppingCart = new Array();
let guitarId = "";
const price = [299.99, 499.99, 899.99];

// Reads the guitars from the JSON file, adds the price and sets an image string
fs.readFile("guitar_data.json", (err, data) => {
  if (err) throw err;
  let guitar = JSON.parse(data);
  guitar.forEach(element => {
    guitarStock.push({
      id: element.guitar_id,
      name: element.name,
      description: element.caption,
      detail: element.description,
      imgString: `./img/guitar_0${element.guitar_id}.png`,
      price: price[element.guitar_id - 1]
    });
  });
});

const stockIndex = function(id) {
  let index = -1;
  let parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    return index;
  } else {
    for (let i = 0; i < guitarStock.length; i++) {
      if (guitarStock[i].id === parsedId) {
        index = i;
      }
    }
    return index;
  }
};

//Create a GET route, '/guitar' route for getting all of the guitars, with its price, image and short description.
router.get('/guitar', (req, res) => {
  res.json(guitarStock);
});

//Create a GET route, '/guitar/:id' that gets all the details on a guitar.
router.get("/guitar/:id", (req, res) => {
  const itemIndex = stockIndex(req.params.id);
  if (itemIndex < 0 || itemIndex >= guitarStock.length) {
    res.json("<h4>This guitar is not in stock</h4>");
  } else {
    let result =
      "<img src=" +
      guitarStock[itemIndex].imgString +
      "></img><ul><li> ID: " +
      guitarStock[itemIndex].id +
      "</li><li> Name: " +
      guitarStock[itemIndex].name +
      "</li><li> Description: " +
      guitarStock[itemIndex].description +
      "</li><li> Price: " +
      guitarStock[itemIndex].price +
      "</li></ul>";
    res.json(result);
  }
});

//Create a PUT route, '/cart/:id' that adds a guitar to the user's session called 'cart'
router.put("/guitar/cart/add/:id", function(req, res) {
  const index = stockIndex(req.params.id);
   let isInCart = false;
   let cartIndex = 0;

  //user session
    if (req.session.cart) {
      shoppingCart = req.session.cart;
   }
    for (let i = 0; i < shoppingCart.length; i++) {
      if (shoppingCart[i].id === parseInt(req.params.id)) {
        isInCart = true;
        cartIndex = i;
      }
  }

   // Adds to the quantity if the guitar is in the cart
  if (isInCart) {
    shoppingCart[cartIndex].qty++;
  } else {
    shoppingCart.push({
      id: guitarStock[index].id,
      name: guitarStock[index].name,
      description: guitarStock[index].caption,
      detail: guitarStock[index].description,
      imgString: `./img/guitar_0${guitarStock[index].id}.png`,
      price: guitarStock[index].price,
      qty: 1
    });
  }
  req.session.cart = shoppingCart;
  res.json("Guitar was added to your cart");
});

// POST - Displays the contents of the user cart
router.post("/guitar/checkout", (req, res) => {
  if (req.session.cart) {
    shoppingCart = req.session.cart;
  }
  req.session.cart = shoppingCart;
  res.json(shoppingCart);
});

//Create a PUT route '/cart/:id/quantity/remove' that removes 1 from the quantity ordered for that specific :id
 router.put("/guitar/cart/remove/quantity/:id", (req, res) => {
  let isInCart = false;
  let cartIndex = 0;
  let id = req.params.id;

  for (let i = 0; i < shoppingCart.length; i++) {
    if (shoppingCart[i].id === parseInt(id)) {
      isInCart = true;
      cartIndex = i;
    }    
  }

  // remove quantity from the cart
  if (isInCart) {
    if (shoppingCart[cartIndex].qty > 0 ) {
      shoppingCart[cartIndex].qty-= 1; 
      req.session.cart= shoppingCart;
      res.json("This quantity  has been removed.");
      if (shoppingCart[cartIndex].qty == 0){
        deleteCart(cartIndex);
      }
    } 
  }
 })


 // this route doesnt need it in this project but I will do it for a requirement 
const deleteCart = (index) => {
  router.delete("/guitar/cart/delete/:id", (req, res) => {  
  let id = req.params.id;
  if (shoppingCart[index].qty == 0 && shoppingCart[index].id == id) {
        return res.json("The user cart is empty");
      }
  });
}

//route to add quantity of a guitar
router.put("/guitar/cart/add/quantity/:id", (req, res ) => {
  let isInCart = false;
  let cartIndex = 0;
  let id = req.params.id;

  //searching for guitar stock id
  for (let i = 0; i < shoppingCart.length; i++) {
    if (shoppingCart[i].id === parseInt(id)) {
      isInCart = true;
      cartIndex = i;
    }    
  }

  //adding quantity into the cart in a specific guitar id
  if(isInCart){
    shoppingCart[cartIndex].qty += 1;
  }

  req.session.cart = shoppingCart; 
  res.json("The quantity has been added !")
  
});

//Create a DELETE route, '/guitar/:id' that delete a specific guitar. completely items and quantity
router.delete("/guitar/:id", (req, res) => {

  let isInCart = false;
  let cartIndex = 0;
  let id = req.params.id;

  if (req.session.userCart) {
    shoppingCart = req.session.userCart;
  }

  for (let i = 0; i < shoppingCart.length; i++) {
    if (shoppingCart[i].id === parseInt(req.params.id)) {
      isInCart = true;
      cartIndex = i;
    }
  }

  // delete the guitar 
  if (isInCart) {
      shoppingCart.splice(cartIndex, 1);
      req.session.userCart = shoppingCart;
      res.json("This guitar has been deleted.");
    } else {
    res.json("This guitar can't be deleted because it is not in the cart.");
  }
});

module.exports = router;

