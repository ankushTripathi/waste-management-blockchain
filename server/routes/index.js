var express = require('express');
var router = express.Router();
var Region = require('../models/regions');
var Mc = require('../models/municipality');
var User = require('../models/user');

/* GET home page.*/
router.get('/test', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', (req,res) => {

	Region.add(req.body)
	.then(region => res.json(region))
	.catch(err => res.json(err));
});

router.get('/', (req,res) => {

	var result = {status : false, data : {}, error : {}};
	result.node_url = '127.0.0.1:8545';

	Region.getAll()
	.then(data => {

		result.status = true;
		result.data = data;
		res.json(result);
	})
	.catch(err => {

		console.log(err);
		result.status = false;
		result.error = err;
		res.json(result);
	});
});


router.get('/:mc', (req,res) => {


	var mc = req.params.mc;

	Mc.getById(mc)
	.then(data => {

		res.json({status : true, data : data, error : {}});
	})
	.catch(err => {

		console.log(err);
		res.json({status : false, data : {}, error : err});
	});
});


router.get('/mc/:user', (req,res) => {


	var user = req.params.user;
	User.getById(user)
	.then(data => {

		res.json({status : true, data : data, error : {}});
	})
	.catch(err => {

		console.log(err);
		res.json({status : false, data : {}, error : err});
	});
});

module.exports = router;
