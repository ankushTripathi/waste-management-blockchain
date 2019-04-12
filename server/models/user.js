const mongoose = require('mongoose');
const Region = require('./regions');
const Mc = require('./municipality');

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

module.exports = {

	model : User,
	getAll,
	getById,
	add,
	update,
	authenticate
};
