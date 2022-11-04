//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.6.12 || ^0.8.0;

pragma experimental ABIEncoderV2;

import "hardhat/console.sol";

interface IERC20 {
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint8);

    function totalSupply() external view returns (uint256);

    function balanceOf(address owner) external view returns (uint256);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 value) external returns (bool);

    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);
}

interface IWETH is IERC20 {
    function deposit() external payable;

    function withdraw(uint256) external;
}

// This contract simply calls multiple targets sequentially, ensuring WETH balance before and after

error BundleExecutor__OnlyOwner(address owner, address caller);
error BundleExecutor__OnlyExecutor(address executor, address caller);
error BundleExecutor__CallFailed();

contract FlashBotsMultiCall {
    address private immutable owner;
    address private immutable executor;
    IWETH private constant WETH = IWETH(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    modifier onlyExecutor() {
        console.log("BundleExecutor__OnlyExecutor");
        if (msg.sender != executor) {
            revert BundleExecutor__OnlyExecutor(executor, msg.sender);
        }
        _;
    }

    modifier onlyOwner() {
        console.log("BundleExecutor__OnlyOwner");
        if (msg.sender != owner) {
            revert BundleExecutor__OnlyOwner(owner, msg.sender);
        }
        _;
    }

    constructor(address _executor) public payable {
        owner = msg.sender;
        executor = _executor;
        if (msg.value > 0) {
            WETH.deposit{value: msg.value}();
        }
    }

    receive() external payable {
        console.log("FlashBotsMultiCall");
    }

    function uniswapWeth(
        uint256 _wethAmountToFirstMarket,
        uint256 _ethAmountToCoinbase,
        address[] memory _targets,
        bytes[] memory _payloads
    ) external payable onlyExecutor {
        require(
            _targets.length == _payloads.length,
            "BundleExecutor: targets and payloads length mismatch"
        );

        if (msg.value > 0) {
            console.log("depositing eth into weth");
            WETH.deposit{value: msg.value}();
        }

        uint256 _wethBalanceBefore = WETH.balanceOf(address(this));

        if (_wethBalanceBefore < _wethAmountToFirstMarket) {
            console.log("BundleExecutor: insufficient WETH balance");
            WETH.deposit{value: address(this).balance}();
        }
        // optimistically transfer WETH to the first market
        // uni v2 does not take any eth directly from you, instead you can send eth to it and you will ask for the other token instead

        console.log("_wethAmountToFirstMarket: ", _wethAmountToFirstMarket);
        WETH.transfer(_targets[0], _wethAmountToFirstMarket);
        console.log("WETH trasfer success");
        for (uint256 i = 0; i < _targets.length; i++) {
            console.log("BundleExecutor__uniswapWeth__call");
            (bool _success, bytes memory _response) = _targets[i].call(_payloads[i]);
            require(_success, "transfer failed");
            _response;
        }

        uint256 _wethBalanceAfter = WETH.balanceOf(address(this));
        console.log("BundleExecutor__uniswapWeth__wethBalanceAfter", _wethBalanceAfter);
        require(
            _wethBalanceAfter > _wethBalanceBefore + _ethAmountToCoinbase,
            "did not make profit"
        );
        console.log("_eth amount to coinbase", _ethAmountToCoinbase);
        if (_ethAmountToCoinbase == 0) return;

        uint256 _ethBalance = address(this).balance;
        if (_ethBalance < _ethAmountToCoinbase) {
            WETH.withdraw(_ethAmountToCoinbase - _ethBalance);
        }
        // this line of code makes sure that you are paying the miner for the transaction, and enables you to send eth to the coinbase only if you meet certain conditions
        // if (some other condition != true) return;
        // if (some state != whatever) {
        //  _ethAmountToCoinbase = 10; increase the amount of eth you are sending to the miner
        // }
        console.log("BundleExecutor__uniswapWeth__transfer__coinbase");
        block.coinbase.transfer(_ethAmountToCoinbase);
    }

    function call(
        address payable _to,
        uint256 _value,
        bytes calldata _data
    ) external payable onlyOwner returns (bytes memory) {
        console.log("BundleExecutor__call");
        require(_to != address(0), "BundleExecutor: cannot call zero address");
        (bool _success, bytes memory _result) = _to.call{value: _value}(_data);
        if (!_success) {
            revert BundleExecutor__CallFailed();
        }
        return _result;
    }

    fallback() external payable {
        console.log("BundleExecutor__fallback");
    }
}
