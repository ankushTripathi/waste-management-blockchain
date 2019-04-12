const Web3 = require('web3');
const mongoose = require('mongoose');

const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

web3.eth.getAccounts()
.then(console.log);

mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("mongodb connected!");
});

mongoose.Promise = Promise;

module.exports = {

	web3
}
