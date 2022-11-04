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
error BundleExecutor__InvalidCallAddress();
error BundleExecutor__NoProfit(uint256 loss);
error BundleExecutor__SwapFailed(address target, bytes data);

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
            console.log("BundleExecutor__uniswapWeth__call", i);
            (bool _success, bytes memory _response) = _targets[i].call(_payloads[i]);
            if (!_success) {
                revert BundleExecutor__SwapFailed(_targets[i], _payloads[i]);
            }
            _response;
        }

        uint256 _wethBalanceAfter = WETH.balanceOf(address(this));

        console.log("wethBalanceAfter", _wethBalanceAfter);

        if (!(_wethBalanceAfter > _wethBalanceBefore + _ethAmountToCoinbase)) {
            revert BundleExecutor__NoProfit(
                _wethBalanceAfter - (_wethBalanceBefore + _ethAmountToCoinbase)
            );
        }

        console.log("_eth amount to coinbase", _ethAmountToCoinbase);

        if (_ethAmountToCoinbase == 0) return;

        uint256 _ethBalance = address(this).balance;
        // this line looks at the contract balance and checks if it can pay the eth, if not then it will withdraw the diffenece from weth, since you know you already made a profit this should not eat into your margins and make you lose money

        if (_ethBalance < _ethAmountToCoinbase) {
            WETH.withdraw(_ethAmountToCoinbase - _ethBalance);
        }

        console.log("profit: ", _wethBalanceAfter - (_wethBalanceBefore + _ethAmountToCoinbase));
        // this line of code makes sure that you are paying the miner for the transaction, and enables you to send eth to the coinbase only if you meet certain conditions
        // if (some other condition != true) return;
        // if (some state != whatever) {
        //  _ethAmountToCoinbase = 10; increase the amount of eth you are sending to the miner
        // }
        block.coinbase.transfer(_ethAmountToCoinbase);
    }

    function call(
        address payable _to,
        uint256 _value,
        bytes calldata _data
    ) external payable onlyOwner returns (bytes memory) {
        console.log("BundleExecutor__call");
        if (_to == address(0)) {
            revert BundleExecutor__InvalidCallAddress();
        }
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
