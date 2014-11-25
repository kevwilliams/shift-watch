var express = require("express");
var app = express();
var expressHbs = require('express-handlebars');
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.engine('hbs', expressHbs({extname:'hbs', defaultLayout:'main.hbs'}));
app.set('view engine', 'hbs');

var mongoose = require("mongoose");
/* You can set this to localhost if you have mongoose - this is a cloud collection I setup for the demo */
mongoose.connect('mongodb://kevoruku:#tdbpw$05@dogen.mongohq.com:10067/app31938718');
var Customer = require('./app/models/customer');

var router = express.Router();

/** Serve the page */
router.get('/', function(req, res) {
	res.render('index');
});

/** Mongoose QueryStream plugs right into the http response stream to spew out the customers */
router.get('/stream', function(req, res) {
  /** Keep-Alive stuff */
  req.socket.setTimeout(Infinity);
	res.writeHead(200, {
				"Content-Type":"text/event-stream",
				"Cache-Control":"no-cache",
				"Connection":"keep-alive"
			});
	res.write('\n');

	console.log('* Connection established. Starting stream.');  
	
	/** Tick */
	setInterval(function() 
	{	
		var stream = Customer.find({}).stream();
		var stack = [];
		
		stream.on('data', function(doc) {
			res.write('data: '+ JSON.stringify(doc) + "\n\n");
			stack.push(doc._id);
		});

		/* Keeps the front/back in sync - we send the complete set of whats in the collection everytime
		 * then walk through that on the front end, removing any items that are in the front but not the back.
		 * There is most likely a better way of doing this, it seems a bit brutish
		 */
		stream.on('close', function() {
			res.write('event: validateCollection'+"\n");
			res.write('data: '+JSON.stringify(stack)+"\n\n");
		});
	}, 1000);

	req.on("close", function() //- buhbye!
	{
		var Caesar = "* jr'ir guvf pbzr sne, yrgf pbagvahr gbtrgure 70 24 97 52 28 *";
		console.log(Caesar);
	});

	return;
});

/** 
 * Router for /customers
 * GET /customers is the List of all Customers
 * POST /customers adds a Customer - expects Name and ZipCode
 */
router.route('/customers')
	.post(function(req, res) {
		var customer = new Customer();
		customer.name = req.body.name;
		customer.region = req.body.region;
		customer.save(function(err) {
			if(err) {
				res.send(err);
			}
			res.json({ message: 'Customer added!' });
		});
	})

	.get(function(req, res) {
		Customer.find(function(err, customers) {
			if(err) {
				res.send(err);
			}
			res.json(customers);
		});
	});

/** 
 * Router for /customers/:id
 * DELETE /customers/:id Deletes a Customer
 */
router.route('/customers/:id')
	.delete(function(req, res) {
		Customer.remove({
			_id: req.params.id
		}, function(err, customer) {
			if(err) {
				res.send(err);
			}
			res.json({message: 'Customer deleted!'})
		});
	});

console.log('#########################################################################');
console.log('#');
console.log('# Kevin Williams - Full-Stack Developer Challenge ');
console.log('# Hey Guys - Thanks for the opportunity!');
console.log('# Really looking forward to talking more with you');
console.log('#');
console.log('#########################################################################');

//- Serve out of / as DocumentRoot
app.use('/', router);

//- Static files (css/js) are served out of /public 
app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 8020;
app.listen(port);

console.log('* Server started - Listening on ' + port);