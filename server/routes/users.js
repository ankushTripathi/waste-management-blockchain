var express = require('express');
var User = require('../models/user');
var utils = require('../utils');

var { web3 } = utils;
var router = express.Router();
var sess;

router.post('/login', (req,res) => {

	var body = req.body;
	if(body == null ||
	   body.email == null ||
	   body.password == null){

		res.json({status : false, error : {msg : "missing field(s)"}});
		return ;
	}

	User.authenticate(body.email,body.password)
	.then(id => {

		if(id != -1){

			sess = req.session;
			sess.id = id;
			res.json({status : true, data : {id : id}, error : {}});
		}
		else{

			res.json({status : false, data : {}, error : {msg : "invalid data"}});
		}
	})
	.catch(err => {

		console.log(err);
		res.json({status : false, data : {}, error : err});
	});

});

router.post('/register', (req,res) => {

	var body = req.body;
	if(body == null ||
	   body.name == null ||
	   body.email == null ||
	   body.password == null ||
	   body.region == null){
		res.json({status : false, error : {msg : "missing field(s)"}});
		return ;
	}

	var address;
	var privateKey;

	User.add({

		name : body.name,
		email : body.email,
		password : body.password,
		region : body.region
	})
	.then(id => {

		var accountObj = web3.eth.accounts.create();
		address = accountObj.address;
		privateKey = accountObj.privateKey;
		return User.model.updateOne({id : id},{address : address, privateKey : privateKey});
	})
	.then(() => {

		res.json({status : true, data : {address : address}, error : {}});
	})
	.catch(err => {

		console.log(err);
		res.json({status : false, data : {}, error : err});
	});

});


router.post('/', (req,res) => {


	var body = req.body;
	if(body == null ||
	  body.id == null){

		res.json({status : false, data : {}, error : {msg : "not logged in"}});
		return ;
	}

	User.profile(body.id)
	.then(data => {

		res.json({status : true, data : data, error : {}});
	})
	.catch(err => {

		console.log(err);
		res.json({status : false, data : {}, error : err});
	});

});

router.post('/request', (req,res) => {

	var body = req.body;
	if(body == null ||
	   body.id == null){

		res.json({status : false, data : {}, error : {msg : "not logged in"}});
		return ;
	}

	User.requestEther(body.id,body.amount)
	.then(data => {

		res.json({status : true, data : data, error : {}});
	})
	.catch(err => {

		console.log(err);
		res.json({status : false, data : {}, error : err});
	});

});

router.post('/bin', (req,res) => {

	var body = req.body;
	if(body == null ||
	   body.id ==null){

		res.json({status : false, data : {}, error : {msg : "not logged in"}});
		return;
	}

	var distance = body.distance;
	var vol = 3.14*20*20*(30-distance);
	var weight = vol*0.0004;
	console.log(distance,weight);

	User.emptyBin(body.id,weight,false)
	.then(receipt => res.json({status : true, data : receipt, error : {}}))
	.catch(err => {

		console.log(err);
		res.json({status : false, data : {}, error : {}});
	});
});

module.exports = router;
