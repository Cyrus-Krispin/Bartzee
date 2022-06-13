var express = require("express");
var path = require("path");
var User = require("../models/userModel");
var Product = require("../models/productModel");
var Org = require("../models/orgModel");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local").Strategy;
var passportLocalMongoose = require("passport-local-mongoose");
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
const flash = require('connect-flash');
var session = require("express-session");
var cookieParser = require("cookie-parser");
var fs = require("fs")
var ObjectId = require('mongodb').ObjectID;
var Auth0Strategy = require("passport-auth0");
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth') 



// setting up multer to stroing uploaded images
var multer = require('multer');
const { Template } = require("ejs");


var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'src/uploads')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now())
	}
});
var upload = multer({ storage: storage });


//login page
router.get('/', (req,res)=>{
	console.log("1: ",req.user)
    Product.find({}).exec(function (err, product) {
		if (err) {
			console.log("Error:", err);
		}
		res.render("index", { layout: false, product: product, user: req.user });

	});
})

//register page
router.get('/register', (req,res)=>{
    res.render('register');
})

// Product Registration Page
router.get("/productReg", ensureAuthenticated, (req, res) => {
	console.log("2: ", req.user)
	Org.find({}).exec(function (err, Organization) {
		if (err) {
			console.log("Error:", err);
		}
		res.render("productReg", { Organization: Organization, layout: false, user: req.user });
	});
})

//Post Product registration
router.post("/productReg", upload.single('image'), (req, res) => {
	console.log(req.file)

	var img = fs.readFileSync(req.file.path);
	var encode_img = img.toString('base64');

	console.log(__dirname+'/uploads');
	var obj = {
		productType: req.body.productType,
		sellerName: req.body.sellerName,
		organization: req.body.organization,
		sellerAddress: req.body.sellerAddress,
		productName: req.body.productName,
		image: {
			data: fs.readFileSync(path.join(__dirname , '..', 'uploads', req.file.filename)),
			contentType: 'image/jpg'
		},
		productQuantity: req.body.productQuantity,
		productDesc: req.body.productDesc,
		productColor: req.body.productColor,
		productSize: req.body.productSize,
		sellerPhone: req.body.sellerPhone,
		sellerEmail: req.body.sellerEmail,
		productPrice: req.body.productPrice,
	}


	Product.create(obj, (err, item) => {
		if (err) {
			console.log(err);
		}
		else {
			item.save();
			console.log("ID: ", item._id)
			Product.find({ '_id': item._id }, (err, prd) => {
				err ? console.log(err) : res.render('review', { prd: prd, user: req.user });
			});
		}
	});

});

// Product review page
router.get("/review/:id", (req, res) => {
	Product.find({ '_id': req.params.id }, (err, prd) => {
		err ? console.log(err) : res.render('review', { prd: prd, layout: false, user: req.user });
	});
})


router.get("/cart", (req, res) => {
	res.render("cart", { layout: false, user: req.user });
})

router.get("/profile", (req, res) => {
	res.render("profile", { layout: false, user: req.user });
})


module.exports = router; 