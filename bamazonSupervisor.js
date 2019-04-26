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

// db.connect()

db.connect(function(err) {
  if (err) throw err;
  menuChoices();
});

function menuChoices (){
    inquirer
    .prompt({
        name: "option",
        type: "list",
        message: "Select an option from the list",
        choices: ["View Product Sales by Department", "Create New Department", "Exit"]
      })
    .then(function(answer) {
        switch (answer.option) {
            case "View Product Sales by Department":
              department();
              break;
      
            case "Create New Department":
              newDepartment();
              break;
      
            case "Exit":
              console.log("Goodbye!")
              db.end();
            }
    });
}

function department(){
    
    db.query('SELECT * FROM departments', function(err, results){
        if(err) throw err;
        console.log('>>>>>>Product Sales by Department<<<<<<');
        console.log('----------------------------------------------------------------------------------------------------')
    
        for(var i = 0; i<results.length;i++){
          console.log("Department ID: " + results[i].departmentID + " | " + "Department Name: " + results[i].departmentName + " | " + "Over Head Cost: " + (results[i].overHeadCosts).toFixed(2) + " | " + "Product Sales: " + (results[i].productSales).toFixed(2) + " | " + "Total Profit: " + (results[i].productSales - results[i].overHeadCosts).toFixed(2));
          console.log('--------------------------------------------------------------------------------------------------')
        }
        menuChoices();
      });
}

function newDepartment() {
    console.log("\n---------------------------\n");
    console.log('---Creating New Department---');
    console.log("\n----------------------------\n");
    inquirer
    .prompt([
      {
        name: "deptName",
        type: "input",
        message: "Please enter DEPARTMENT NAME:  ",
      },
      {
        name: "ohc",
        type: "input",
        message: "Please enter OVER HEAD COSTS: ",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "prodSales",
        type: "input",
        message: "Please enter PRODUCT SALES:  ",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {
        db.query('INSERT INTO departments SET ?',{ departmentName: answer.deptName, overHeadCosts: answer.ohc, productSales: answer.prodSales
          }, function(err, res){
            if(err) throw err;
            console.log('A new department was successfully added.');
            menuChoices();
          });
          
    });
    
      
}