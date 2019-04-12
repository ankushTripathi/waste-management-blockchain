pragma solidity ^0.5.0;

contract Faucet{
    
    address payable public owner;
    
    event LogGiveTo(address user,uint amount);
    
    constructor() public payable{
        
        require(msg.value > 0);
        owner = msg.sender;
    }
    
    function kill() public{
        
        require(msg.sender == owner);
        selfdestruct(owner);
    }
    
    function giveTo(address payable user, uint amount) public{
        
        require(msg.sender == owner);
        require(user != address(0));
        require(amount <= address(this).balance);
        
        user.transfer(amount);
        emit LogGiveTo(user,amount);
    }
    
    function () external payable{}
}
