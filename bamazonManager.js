// load Node.js modules
require('dotenv').config();
const inquirer = require('inquirer');
const mysql = require('mysql');
const Table = require('cli-table');

//Load database credential for .env
const keys = require('./keys');

// MySQL connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    database: 'bamazon',
    user: keys.mysql.username,
    password: keys.mysql.password
  
});

db.connect()

db.query('SELECT * FROM Products', function(err, results) {
    if (err) {
        throw err;
    }
    menuChoices();
});
//Create list of options for the user to select from
var menuChoices = function(){
    inquirer.prompt([{
        type: 'list',
        name: 'inventory',
        message: 'Please choose option.',
        choices: [
            '1) View Products for Sale',
            '2) View Low Inventory',
            '3) Add to Inventory',
            '4) Add New Product'
        ]
    }]).then(function(answers){
        // console.log(answers);
        switch(answers.inventory) {
            case '1) View Products for Sale': viewProducts(); 
            break;
            case '2) View Low Inventory': viewLowInvent();
            break;
            case '3) Add to Inventory': addInvent(); 
            break;
            case '4) Add New Product': addProducts();
            break;
            case 'Exit':
            console.log('Exiting now!')
            db.end();
        }
    })
}

var viewProducts = (function() {
    db.query('SELECT * FROM Products', function(err, results) {
    if (err) {
        throw err;
    console.log(results.product_name);
    }

        results.forEach(function(row){
            console.log('Item ID:', row.item_id);
            console.log('Product:', row.product_name);
            console.log('Department:', row.department_name);
            console.log('Price:', row.price);
            console.log('Stock Available', row.stock_quantity);
            console.log('-------------------------------')
        })
    })
});

//Function to check for products with (5) or fewer items

var viewLowInvent = (function lowInventory (){
    console.log("Viewing Low Inventory");
    var query = 'SELECT * FROM products WHERE stock_quantity <= 5'; 
    db.query(query, function(err, results) {
        if(err) throw err;
    
        if (results.length===0) {
            console.log('Current inventory looks great!');
        }else{
    for (var i = 0; i < results.length; i++) {
    console.log("Item ID: " + results[i].item_id + " | " + "Product: " + results[i].product_name + " | " + "Department: " + results[i].department_name + " | " + "Price: " + results[i].price + " | " + "QTY: " + results[i].stock_quantity);
        }  
    }
    menuChoices();
  });
})

//Function to Add additional inventory to the db
var addInvent = function addInventory (){
    console.log("Add additional Inventory");
    db.query('SELECT * FROM products', function(err, results){
        if(err) throw err;
        console.log('----------------------------------------------------------------------------------------------------');
        for(var i = 0; i<results.length;i++){
          console.log("ID: " + results[i].item_id + " | " + "Product: " + results[i].product_name + " | " + "Department: " + results[i].department_name + " | " + "Price: " + results[i].price + " | " + "QTY: " + results[i].stock_quantity);
          console.log('--------------------------------------------------------------------------------------------------');
        }
   
    inquirer
    .prompt([
        {
            name: "idNum",
            type: "input",
            message: "Enter the Item ID number of product to add additional inventory: "
        },
        {
            name: "addInventory",
            type: "input",
            message: "How many items would you like to add?",
            validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
            }
        }
    ])
    .then(function(answer) {
        db.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?",
            [(results[answer.idNum-1].stock_quantity + parseInt(answer.addInventory)), answer.idNum],
            function(err) {
              if (err) throw err;
              console.log("The update was successful!");
              menuChoices();
            }
          );
    });
});
}


var addProducts = function addProduct (){
    console.log("Add Product");
    inquirer
    .prompt([
        {
            name: "idNum",
            type: "input",
            message: "Please Enter the ID number: "
        },
        {
            name: "product",
            type: "input",
            message: "Please Enter product name: "
        },
        {
            name: "dep",
            type: "input",
            message: "Please Enter department name: "
        },
        {
            name: "price",
            type: "input",
            message: "Please Enter price: "
        },
        {
            name: "qty",
            type: "input",
            message: "Please Enter Quantity: ",
            validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
            }
        }
    ])
    .then(function(answer) {
        // 
        db.query("INSERT INTO products SET ?",
        {
            item_id: parseInt(answer.idNum),
            product_name: answer.product,
            department_name: answer.dep,
            price: parseFloat(answer.price),
            stock_quantity:parseInt(answer.qty)
        },
            function(err) {
              if (err) throw err;
              console.log("Product successfully added!");
              menuChoices();
            }
          );
    });
}
