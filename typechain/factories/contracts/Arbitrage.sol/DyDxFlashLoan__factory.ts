/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  DyDxFlashLoan,
  DyDxFlashLoanInterface,
} from "../../../contracts/Arbitrage.sol/DyDxFlashLoan";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "WETH",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "currencies",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "tokenToMarketId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x6080604052731e0447b19bb6ecfdae1e4ae1694b0c3659614e4e6000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555073c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503480156100b957600080fd5b50600160026000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055506103a4806101306000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80636036cba314610046578063ad5c464814610076578063b826878814610094575b600080fd5b610060600480360381019061005b91906101b5565b6100c4565b60405161006d919061025e565b60405180910390f35b61007e6100dc565b60405161008b9190610223565b60405180910390f35b6100ae60048036038101906100a991906101b5565b610102565b6040516100bb919061025e565b60405180910390f35b60026020528060005260406000206000915090505481565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050600081141561018b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101829061023e565b60405180910390fd5b600181610198919061028a565b915050919050565b6000813590506101af81610357565b92915050565b6000602082840312156101cb576101ca610329565b5b60006101d9848285016101a0565b91505092915050565b6101eb816102be565b82525050565b60006101fe601c83610279565b91506102098261032e565b602082019050919050565b61021d816102f0565b82525050565b600060208201905061023860008301846101e2565b92915050565b60006020820190508181036000830152610257816101f1565b9050919050565b60006020820190506102736000830184610214565b92915050565b600082825260208201905092915050565b6000610295826102f0565b91506102a0836102f0565b9250828210156102b3576102b26102fa565b5b828203905092915050565b60006102c9826102d0565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600080fd5b7f466c6173684c6f616e3a20556e737570706f7274656420746f6b656e00000000600082015250565b610360816102be565b811461036b57600080fd5b5056fea264697066735822122073abc24ab151855b423182f2a04cbcf97242dcd619131a363aa585a361f9cf9e64736f6c63430008070033";

type DyDxFlashLoanConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DyDxFlashLoanConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DyDxFlashLoan__factory extends ContractFactory {
  constructor(...args: DyDxFlashLoanConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<DyDxFlashLoan> {
    return super.deploy(overrides || {}) as Promise<DyDxFlashLoan>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): DyDxFlashLoan {
    return super.attach(address) as DyDxFlashLoan;
  }
  override connect(signer: Signer): DyDxFlashLoan__factory {
    return super.connect(signer) as DyDxFlashLoan__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DyDxFlashLoanInterface {
    return new utils.Interface(_abi) as DyDxFlashLoanInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DyDxFlashLoan {
    return new Contract(address, _abi, signerOrProvider) as DyDxFlashLoan;
  }
}
