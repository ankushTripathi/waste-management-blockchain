pragma solidity ^0.5.0;

contract WasteManagement{
    
    mapping (address => uint) public balances;
    mapping (string => address) municipalities;
    
    uint non_reusable_rate = 3;
    uint reusable_rate = 2;
    
    event LogAddRegion(string region, address municipality);
    event LogPay(address user, address municipality, uint amount);
    event LogWithdraw(address municipality, uint amount);
    
    constructor() public {}
    
    function addMunicipality(string memory region, address municipality) public {
        
        municipalities[region] = municipality;
        emit LogAddRegion(region,municipality);
    }
    
    function getMunicipalities(string memory region) public view returns(address){
        
        return municipalities[region];
    }
    
    
    function estimatePrice(uint weight,bool reusable) public view returns(uint amount,bool success){
        
        amount = (reusable)? weight*reusable_rate : weight*non_reusable_rate;
        success = (msg.sender.balance >= amount);
    }
    
    function pay(address municipality, uint weight,bool reusable) public payable{
        
        uint amount;
        bool success;
        (amount,success) = estimatePrice(weight,reusable);
        
        require(success);
        require(msg.value >= amount);
        require(municipality != address(0));
        
        balances[municipality] += amount;
        emit LogPay(msg.sender, municipality, amount);
    }
    
    function withdraw() public {
        
        uint amount = balances[msg.sender];
        require(amount > 0);
        balances[msg.sender] = 0;
        msg.sender.transfer(amount);
        emit LogWithdraw(msg.sender, amount);
    }
}
