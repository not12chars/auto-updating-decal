// Require essentials
const noblox = require('noblox.js');
var cronJob = require('cron').CronJob;
require('dotenv').config();

// Intialize variables
var sales = 0; // Keep track of sales
var usersWhoPurchased = []; // Keep track of users whose sales were counted
const decalId = 14864313218;

// Start
console.log("Program ready to start");

async function startApp () {
    // Log in using cookie
    const cookie = process.env.ROBLOSECURITY;
    const currentUser = await noblox.setCookie(cookie); 
    console.log(`Logged in as ${currentUser.UserName} [${currentUser.UserID}]`);
  
    // Update decal function
    async function updateDecal(date) {
        try {
            await noblox.configureItem (
              decalId, // Asset ID
              "Auto updating decal", // Title
              /*

              Description:

              Sales: X
              This decal automatically updates every hour with the number of sales it has.
              Last updated: Mon, 25 Sep 2023 17:00:00 GMT
              Image from Unsplash

              */
              "Sales: " + sales + "\n\nThis decal automatically updates every hour with the number of sales it has.\n\nLast updated: " + date + "\nImage from Unsplash\n\nIf the description is moderated when the bot tries to update it, it will not show the new sales count. The bot will try to update it again at the next hour."
            );
            console.log("Successfully updated decal at " + date);
          
          } catch (error) {
              console.log("An error occurred:", error);
          };
    };

    // Update decal function
    async function getTransactions() {
        try {
            // Gets transactions
            console.log("Fetching transactions");
            let transactions = await noblox.getUserTransactions("Sale", 999999999999); // Get all (999999999999) transactions

            // Loop thru transactions
            console.log("Looping thru transactions");
            for (let i = 0; i < transactions.length; i++) {
                const userId = transactions[i].agent.id; // Get ID of user who purchased decal in current transaction
                const transactionId = transactions[i].id; // Get ID of current transaction

                // If user is in array, their sale was counted already; skip the transaction
                if (usersWhoPurchased.includes(userId)) {
                    console.log("Transaction " + transactionId + ", user already took decal, not counting sale");
                } else { // User's sale is not counted yet
                    usersWhoPurchased.push(userId); // Add user ID to array of users whose sales were counted
                    sales += 1; // Add 1 sale
                    // console.log("Transaction " + transactionId + ", new user took decal, +1 sale");
                };
            };
            console.log("Sales: " + sales);

        } catch (error) {
            console.log("An error occurred:", error);
        };

        const now = new Date(); // Get current date and time
        const utcDate = now.toUTCString(); // Convert date and time to UTC string

        updateDecal(utcDate); // Update the decal description
      
      
        // Reset variables for next count (tommorrow)
        sales = 0;
        usersWhoPurchased = [];
      
    };

    // Schedule new job
    var job = new cronJob (
        '0 * * * *', // Runs every hour
        getTransactions, // Runs function to get sales and update decal
        null, // No function to run when job stops
        false, // Will not start automatically
        'Etc/UTC' // UTC time zone
    );

    job.start(); // Start job

};

startApp(); // Start script



// Set up http server
const port = process.env.PORT || 3000;

const http = require('http');
const server = http.createServer(function(req, res){
    console.log(`Just got a request at ${req.url}!`)
    res.write('200 (OK)');
    res.end();
});

server.listen(port);