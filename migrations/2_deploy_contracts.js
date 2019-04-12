const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());
const Faucet = artifacts.require('Faucet');
const SWM = artifacts.require('WasteManagement');


module.exports = function(deployer,network,accounts){

	deployer.deploy(Faucet, {from : accounts[0], value : web3.utils.toWei('10','ether')})
	.then(() => {

		return deployer.deploy(SWM);
	})
	.then(swm => {

		var promises = [];
		for(i=1;i<=4;i++){

			promises.push(swm.addMunicipality("region"+i,accounts[i]));
		}

		return Promise.all(promises);
	})
	.then(console.log)
	.catch(console.log);
}
