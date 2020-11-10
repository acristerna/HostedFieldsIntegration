const gateway = require('../lib/gateway');
const express = require('express');
const router = express.Router();
const braintree = require("braintree");

// to read search results
const date = require('date-utils');
const stream = require('stream');
const readable = require('stream').Readable;


// error handler 
function formatErrors(errors) {
	let errString = "";
	for (const i in errors) {
		if (errors.hasOwnProperty(i)) {
			errString = errString + errors[i].code + " / " + errors[i].message + " / " + errors[i].attribute + " ";
		}
	}
	return errString;
}

//	const deepErrors = result.errors.deepErrors();
// for (const i in deepErrors) {
//     if (deepErrors.hasOwnProperty(i)) {
//       console.log(deepErrors[i].code);
//       console.log(deepErrors[i].message);
//       console.log(deepErrors[i].attribute);
//     }

// get homepage and get client token 
router.get('/', function (req, res, next) {
	gateway.clientToken.generate({}, function (err, response) {
		res.render('index', {
			client_token: response.clientToken,
			messages: req.flash('error')
		})
	});
});

// post transaction information to the results page including outside HF information
router.post('/results-page', function (req, res, next) {
	let paymentMethodNonce = req.body.nonce;
	let firstName = req.body["first-name"]; // from form value
	let lastName = req.body["last-name"]; // from form value
	let amount = req.body.amount; // from form value

	// create customer
	gateway.customer.create({ // create customer with just name
		firstName: firstName,
		lastName: lastName
	}, function (err, result) {
		if (result !== undefined && result.success) {
			gateway.paymentMethod.create({ // create payment method using nonce and resulted customer id
				customerId: result.customer.id,
				paymentMethodNonce: paymentMethodNonce,
				options: {
					verifyCard: true // card verification
				}
			}, function (err, result) {
				if (result.success) { // if the payment method is created, use result for createTransaction method vv
					createTransaction(result.paymentMethod);
				} else if (result.success == false) {
					const deepErrors = result.errors.deepErrors();
					formatErrors(deepErrors);
					req.flash('error', {
						msg: formatErrors(deepErrors)
					});
					res.redirect('/');
				} else {
					console.log("Error!");
					console.log(err.message);
				}
			});
		} else if (result !== undefined && result.success == false) {
			const deepErrors = result.errors.deepErrors();
			formatErrors(result.errors.deepErrors());
			req.flash('error', {
				msg: formatErrors(deepErrors)
			});
			res.redirect('/');
		} else {
			console.log("Error happened!");
			console.log(err.message);
		}
	})

	// create transaction using a payment method token 
	function createTransaction(paymentMethod) {
		gateway.transaction.sale({
			amount: amount,
			paymentMethodToken: paymentMethod.token,
			options: {
				submitForSettlement: true
			}
		}, function (err, result) {
			if (result.success || result.transaction) {
				res.render('results-page', {
					transaction: result.transaction,
					success: result.success
				});
			} else {
				const deepErrors = result.errors.deepErrors();
				req.flash('error', {
					msg: formatErrors(deepErrors)
				});
			}
		});
	}
});

// get search results
router.get('/search', function (req, res, next) {

	// transaction search using "created at" to pull transactions from today to 3 months ago
	// stream to read data from transaction.search
	const streamResults = gateway.transaction.search(function (search) {
		search.createdAt().between(Date.today().addMonths(-3), Date(Date.now()));
	});

	streamResults.on("ready", function () {
		console.log(streamResults.searchResponse.length());
	});

	// array to hold transaction search results
	let searchResults = [];

	// add to array 
	streamResults.on("data", function (transaction) {
		searchResults.push(transaction);
	});

	// once completed, get array for results and send to search page
	streamResults.on("end", function () {
		res.render('search', {
			transactions: searchResults
		});
	});
});

module.exports = router;