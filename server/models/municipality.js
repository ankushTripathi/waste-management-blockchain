const mongoose = require('mongoose');

var mcSchema = new mongoose.Schema({

	id : Number,
	address : String,
	privateKey : String,
	name : String,
	region : String,
	bins : [{

		id : Number,
		name : String,
		total_waste : Number,
		total_reusable_waste : Number,
		date : Date,
		total_amount : Number
	}]

});

var Mc = mongoose.model('Mc', mcSchema);

const getAll = async () => {

	var mcs = await Mc.find();
	return mcs;
};

const getById = async (mc_id) => {

	var mc = await Mc.findOne({id : mc_id});
	return mc;
};

module.exports = {

  model : Mc,
  getAll,
  getById
};
