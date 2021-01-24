$(function() {

        // GET -  Set the getAllGuitarsButton to display the guitars when clicked
        $("#getAllGuitar").click(() => {
          fetch("http://localhost:3000/guitar/", {
            method: "GET",
            mode: "cors",
            redirect: "follow",
            headers: new Headers({ "Content-Type": "text/plain" })
          })
            .then(response => {
              return response.json();
            })
            .then(guitars => {
              $("#displayAll").toggle();
              $("#displayAll").html(
                "<table class='table table-hover '></table>"
              );
              $("#displayAll table").append(
                "<thead class='thead-dark'><tr><th>ID</th><th>Image</th><th>Name</th><th>Description</th><th>Price</th><th>Action</th></tr></thead>"
              );
              
              guitars.forEach(guitar => {
                const { id, name, description, imgString, price } = guitar;
                $("#displayAll table").append(
                  `<tr class='info'><td class="id">${guitar.id}</td><td><img src='${imgString}' height='205' width='82'></img></td><td>${name}</td><td>${description}</td><td>$${price}</td>` +
                  `<td><button class="view" type="button" class="btn btn-outline-secondary">View</button></td> </tr>`
                );
              });
            })
            .catch(errors => {
              console.log(`Could not post new entry: ${errors}`);
            });
        });
      
        //Create a GET route, '/guitar/:id' that gets all the details on a guitar.
        $("div#displayAll").on('click', '.view', function() {
            let rowEl = $(this).closest('tr');
            let id = rowEl.find('.id').text();
            
            $(".bg-modal").css('display', 'flex');
            
            fetch("http://localhost:3000/guitar/" + id, {
                method: "GET",
                mode: "cors",
                redirect: "follow",
                headers: new Headers({ "Content-Type": "text/plain" })
              })
                .then(response => {
                  return response.json();
                })
                .then(guitar => {
                  // Append data to div element
                  $("div.modal-contents").append("<h2>Guitar selected details:</h2><br>");
                  $("div.modal-contents").append(`${guitar}`);
                  $("div.modal-contents").append('<div class="close"> <img  id="close-icon" src="./img/close.jpg" alt=""> </div>');
                 
                  // The button is not added if the error message is received
                  if (guitar.length > 40) {
    
                    // Button to add a guitar to the cart
                    $("div.modal-contents").append(
                      '<button id="addGuitar" name="btnAdd" class="btn btn-success" onclick="addGuitar('  + id + ')"> Add Guitar to Cart</button>'
                    );
                  }                
                })
              
                .catch(errors => {
                  console.log(`Could not post new entry: ${errors}`);
                });
            }); 
            
        //Create a POST route, '/cart/checkout' that all the items in the cart.      
        const userCart = () => {
          let sum = 0;
          fetch("http://localhost:3000/guitar/checkout/", {
            method: "POST",
            mode: "cors",
            redirect: "follow",
            headers: new Headers({ "Content-Type": "text/plain" })
          })
            .then(response => {
              return response.json();
            })
            .then(guitars => {
             
              $("div.modal-contents").empty();     
              // Displays different message if the cart is empty
              if (guitars.length === 0) {
                $("div.modal-contents").append("<h2>User Cart is empty </h2>");
              } else {
                
                $("div.modal-contents").append("<h2>User Cart:</h2><table class='table table-bordered'></table>");
                $("div.modal-contents table").append(
                  "<thead class='thead-dark'><tr><th>ID</th><th>Image</th><th>Name</th><th>Description</th><th>Item Price</th><th>Quantity</th><th>Total Price</th><th> Action </th></tr></thead>"
                );
                 $("div.modal-contents").append('<div class="close"> <img  id="close-icon" src="./img/close.jpg" alt=""> </div>');            
                
                guitars.forEach(guitar => {
                  const { id, name, description, imgString, price, qty } = guitar;
                  let totalPrice = (price * qty);
                  sum += totalPrice;
                  let totalPriceString = totalPrice.toFixed(2); 
                  $("div.modal-contents table").append(
                    `<tr>
                      <td class="deleteId">${id}</td>
                      <td><img src='${imgString}' height='205' width='82'>
                      </img></td><td>${name}</td>
                      <td>${description}</td>
                      <td><span id="priceQty">$${price}</span></td>
                      <td> <span id="textQty">${qty} </span><div id=container-qty"><button class="btn-info btn-qty" onclick="addQuantity()">Add Quantity </button> </div>
                      <div id=container-qty"><button class="btn-danger btn-qty" onclick="RemoveQuantity()">Remove Quantity </button> </div>  
                      <td><span id="totalPrice">$${totalPriceString}</span></td>
                      <td> <div ><button id="qty-delete" class="btn-danger btn-qty" onclick="deleteGuitar()">Delete</button> </div>  </td></tr>`
                  );
                }); 
                
                let sumString = (Math.round((sum) * 100)/100).toFixed(2); 
                $("div.modal-contents table").append(
                  `<tr><td class='font-weight-bold font-italic'>TOTAL: </td><td colspan='5'></td><td>$${sumString}</td></tr>`
                );
              }                
             
              $("div.modal-contents").append('<div class="close"> <img  id="close-icon" src="./img/close.jpg" alt=""> </div>');
                        
            })
            .catch(errors => {
              console.log(`Could not post new entry: ${errors}`);
            });
      }
      //add userCart click function  2 button with the same outcome
      $("div.modal-contents").on('click', '#addUserCart', userCart);

      //user cart display on the main page
      $("#userCartMain").click (() => {
        $(".bg-modal").css('display', 'flex');
        userCart();
      });

      //display close button
        $("div.modal-contents").on('click', '#close-icon', function (){
          $(".bg-modal").css('display', 'none');
          $("div.modal-contents").empty();
        });                
});

//Create a PUT route '/cart/:id/quantity/add' that adds 1 more to the quantity ordered for that specific :id.
const addQuantity = function(){ 
  let rowEl = $(event.target).closest('tr');
  let id = rowEl.find('.deleteId').text();

  fetch("http://localhost:3000/guitar/cart/add/quantity/"+ id , ({
    method: "PUT",
    mode: "cors",
    redirectL: "follow",
    headers: new Headers({ "Content-Type": "text/plain"})
  }))
  .then(response => {
    return response.json(); 
  })
 .then(data => {
  $("div.modal-contents").empty();
  $("div.modal-contents").append(`<br /><h4>${data}</h4>`);
  $("div.modal-contents").append('<button id="addUserCart" name="btnAddCart" class="btn btn-warning"> Shopping Cart</button><br><br>');
  $("div.modal-contents").append('<div class="close"> <img  id="close-icon" src="./img/close.jpg" alt=""> </div>');  
})
  .catch(error => {
    console.log( `Couldn't post a new entry ${error}`)
  })
}

const RemoveQuantity = () => {
    let rowEl = $(event.target).closest('tr');
    let id = rowEl.find('.deleteId').text();

    let rowFl = $(event.target).closest('tr');
    let qty = rowFl.find('#textQty').text();
  
    qty = parseInt(qty);
    console.log(qty);

    if(qty !=  0){
      fetch("http://localhost:3000/guitar/cart/remove/quantity/"+ id , ({
      method: "PUT",
      mode: "cors",
      redirectL: "follow",
      headers: new Headers({ "Content-Type": "text/plain"})
    }))
    .then(response => {
      return response.json(); 
    })
   .then(data => {
    $("div.modal-contents").empty();
    $("div.modal-contents").append(`<br /><h4>${data}</h4>`);
    $("div.modal-contents").append('<button id="addUserCart" name="btnAddCart" class="btn btn-warning"> Shopping Cart</button><br><br>');
    $("div.modal-contents").append('<div class="close"> <img  id="close-icon" src="./img/close.jpg" alt=""> </div>');  
  })
    .catch(error => {
      console.log( `Couldn't post a new entry ${error}`)
    })
  } else if (qty == 0) {
    fetch("http://localhost:3000/guitar/cart/delete/"+ id , ({
      method: "DELETE",
      mode: "cors",
      redirectL: "follow",
      headers: new Headers({ "Content-Type": "text/plain"})
    }))
    .then(response => {
      return response.json(); 
    })
   .then(data => {
    $("div.modal-contents").empty();
    $("div.modal-contents").append(`<br /><h4>${data}</h4>`);
    $("div.modal-contents").append('<div class="close"> <img  id="close-icon" src="./img/close.jpg" alt=""> </div>'); 
  })
    .catch(error => {
      console.log( `Couldn't post a new entry ${error}`)
    })
  }    
}

const addGuitar = function(id){
  fetch("http://localhost:3000/guitar/cart/add/" + id, {
    method: "PUT",
    mode: "cors",
    redirect: "follow",
    headers: new Headers({ "Content-Type": "text/plain" })
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      $("div.modal-contents").empty();
      $("div.modal-contents").append(`<br /><h4>${data}</h4>`);
      $("div.modal-contents").append('<button id="addUserCart" name="btnAddCart" class="btn btn-success"> Shopping Cart</button>'); 
      $("div.modal-contents").append('<div class="close"> <img  id="close-icon" src="./img/close.jpg" alt=""> </div>');   
    })
    .catch(errors => {
      console.log(`Could not post new entry: ${errors}`);
    });
};  


//Create a DELETE route, '/guitar/:id' that delete a specific guitar including quantity.
const deleteGuitar = () => {
  let rowEl = $(event.target).closest('tr');
  let id = rowEl.find('.deleteId').text();

  fetch("http://localhost:3000/guitar/"+ id , {
    method: "DELETE",
    mode: "cors",
    redirect: "follow",
    headers: new Headers({ "Content-Type": "text/plain" })
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      $("div.modal-contents").empty();
      $("div.modal-contents").append(`<br /><h4>${data}</h4>`);
      $("div.modal-contents").append('<button id="addUserCart" name="btnAddCart" class="btn btn-success"> Shopping Cart</button>'); 
      $("div.modal-contents").append('<div class="close"> <img  id="close-icon" src="./img/close.jpg" alt=""> </div>');   
    })
    .catch(errors => {
      console.log(`Could not post new entry: ${errors}`);
  });
};