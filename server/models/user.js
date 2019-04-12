const mongoose = require('mongoose');
const Region = require('./regions');
const Mc = require('./municipality');
const path = require('path');
const contract = require('truffle-contract');
const utils = require('../utils');

const {web3} = utils;

const faucetJson = require(path.join(__dirname, '../../build/contracts/Faucet.json'));
var provider    = web3.currentProvider;
var faucet = contract(faucetJson);
faucet.setProvider(provider);

const swmJson =  require(path.join(__dirname, '../../build/contracts/WasteManagement.json'));
var  swm = contract(swmJson);
swm.setProvider(provider);

var userSchema = new mongoose.Schema({

	id : Number,
	address : String,
	privateKey : String,
	name : String,
	email : String,
	password : String,
	region : String,
	mc : String,
	bins : [{

		weight : Number,
		reusable : Boolean,
		amount : Number
	}]
});


var User  = mongoose.model('User',userSchema);

const getAll =  async () => {

	var users = await User.find();
	return users;
};

const getById = async (user_id) => {


	var user = await User.findOne({id : user_id});
	return user;
};

const add = async (user) => {


	var lastId = await User.countDocuments();
	var region = await Region.model.findOne({name : user.region});
	user.id = lastId+1;
	user.mc = region.municipality;
	var newUser = new User(user);
	await newUser.save();
	region.userCount++;
	await region.save();
	var mc = await Mc.model.findOne({id : region.mc_id});
	mc.bins.push({id : user.id, name : user.name, total_waste : 0, total_reusable_waste : 0, total_amount : 0});
	await mc.save();
	return  user.id;
};

const update = async (id,data) => {


	await User.updateOne({id : id}, data);
};

const authenticate = async (email, password) => {

	var user = await User.findOne({email : email, password : password});
	if(user == null)
		return -1;
	else
		 return user.id;

};

const profile = async (id) => {

	var user = await User.findOne({id : id});
	var balance = await web3.eth.getBalance(user.address);
	return {user, balance};
};

const requestEther = async (id,amount) => {

	var accounts = await web3.eth.getAccounts();
	var user  = await User.findOne({id : id});
	var instance = await faucet.deployed();
	var receipt = await instance.giveTo(user.address,amount, {from : accounts[0], gas : '60000'});
	return receipt;
};

const emptyBin = async (id,weight,reusable) => {


	var user = await User.findOne({id : id});
	var mc = await Mc.model.findOne({name : user.mc});
	var amount = Math.floor(weight*3);
	var instance = await swm.deployed();
	var swmContract = new web3.eth.Contract(swmJson.abi,instance.address);

	var data = swmContract.methods.pay(mc.address,weight,reusable).encodeABI();

	var tx = await web3.eth.accounts.signTransaction({
		from : user.address,
		to : instance.address,
		data : data,
		gas : '60000',
		gasPrice : '200',
		value : amount
	},user.privateKey);

	var receipt = await web3.eth.sendSignedTransaction(tx.rawTransaction);

	user.bins.push({weight : weight, reusable : reusable, amount : amount});
	await user.save();

	var newBins = [];
	var updatedBin = {};

	for(bin of mc.bins){

		if(bin.id == user.id){

			updatedBin.id = bin.id;
			updatedBin.name =  bin.name;
			updatedBin.total_waste = bin.total_waste+weight;
			updatedBin.total_reusable_waste = bin.total_waste+(reusable)? weight : 0;
			updatedBin.total_amount = bin.total_amount+amount;
			updatedBin.date = new Date();
			newBins.push(updatedBin);
		}
		else
		   newBins.push(bin);
	}

	mc.bins = newBins;
	await mc.save();

	var region = await Region.model.findOne({name : user.region});
	region.total_waste += weight;
	region.total_reusable_waste += (reusable)? weight : 0;
	region.total_amount += amount;
	await region.save();

	return receipt;
};

module.exports = {

	model : User,
	getAll,
	getById,
	add,
	update,
	authenticate,
	requestEther,
	profile,
	emptyBin
};
