# Hosted Fields Integration

This application creates a Braintree Hosted Fields integration using Braintree's JavaScript web SDK and Node.js server SDK. It also uses Express and EJS as a framework and templating language. It will create a customer and attempt to verify their payment method. If verification successful, it will create a payment method for that customer and then create a transaction using that payment method token. Once the transaction is complete, you will be sent to a results page with either a success or failure message and you will see the current status of the transaction and its transaction ID. If a validation error occurs, an alert will notify you on the homepage to retry your card information. You can also see the client token and nonce via the console.

This app also has the ability to create a transaction search over the last 3 months by hitting the "Transaction Search" button in the navbar. It will also detail the total number of transactions over this time period at the bottom. Please note that any new transactions will be added within 30 secs so if it does not appear right away, give it a few and it should appear.

## How to setup app

Assumed: Your computer has Node installed already. 

1. Download and save file locally.
2. Open the main project folder in terminal and install packages via npm: 
```npm install```
3. Create new .env file and copy contents from ```example.env``` into it. You will need to update values to match your Braintree Sandbox credentials here. 
4. Update merchant ID number in the two td hrefs included in the /views/search.ejs file. 

    merchants/84ghq2kkh4bfvv27/ --> merchants/your_merchant_ID_here/

    This will ensure all links are appropriate to your sandbox.
5. Run the application via npm: 
```npm start```
6. Open browser and navigate to: ```localhost:3000```

## Testing

Using Braintree's testing amounts and cards, you can generate different transaction responses. This integration can handle successful and unsuccessful verifications and transactions. 

https://developers.braintreepayments.com/reference/general/testing



