const mongoose = require('mongoose');

var regionSchema = new mongoose.Schema({

	name : String,
	mc_id : Number,
	municipality : String,
	userCount : Number,
	total_waste : Number,
	total_reusable_waste : Number,
	total_amount : Number

});

var Region = mongoose.model('Region', regionSchema);

const getAll = async () => {

	var regions = await Region.find();
	return regions;
};

const add = async(region) => {

	var newRegion = new Region(region);
	await newRegion.save();
	return newRegion;
}

module.exports = {

  model : Region,
  getAll,
  add
};
