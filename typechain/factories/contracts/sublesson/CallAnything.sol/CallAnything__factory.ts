/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  CallAnything,
  CallAnythingInterface,
} from "../../../../contracts/sublesson/CallAnything.sol/CallAnything";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "someAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "callTransferFunctionDirectly",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "someAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "callTransferFunctionDirectlyTwo",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getCallData",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "someAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "getDataToCallTransfer",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "getSelectorFour",
    outputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "getSelectorOne",
    outputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "functionCallData",
        type: "bytes",
      },
    ],
    name: "getSelectorThree",
    outputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "getSelectorTwo",
    outputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSignatureOne",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "s_amount",
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
    inputs: [],
    name: "s_someAddress",
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
        name: "someAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610e0d806100206000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c8063a9059cbb11610071578063a9059cbb14610192578063aad229d5146101ae578063b20d9446146101cc578063c6e93bad146101fd578063ce6eb7ff1461021b578063fbf6d5151461024b576100b4565b80630bf9aa4c146100b957806325435a56146100d75780637c0c5f23146100f5578063852d52fa146101255780639a41d3ad14610143578063a5694e4a14610161575b600080fd5b6100c1610269565b6040516100ce9190610b19565b60405180910390f35b6100df610301565b6040516100ec9190610ad5565b60405180910390f35b61010f600480360381019061010a9190610871565b610310565b60405161011c9190610b19565b60405180910390f35b61012d610392565b60405161013a9190610b3b565b60405180910390f35b61014b6103cf565b6040516101589190610ad5565b60405180910390f35b61017b60048036038101906101769190610871565b610413565b604051610189929190610af0565b60405180910390f35b6101ac60048036038101906101a79190610871565b610514565b005b6101b661055f565b6040516101c39190610a68565b60405180910390f35b6101e660048036038101906101e19190610871565b610583565b6040516101f4929190610af0565b60405180910390f35b61020561069c565b6040516102129190610b5d565b60405180910390f35b610235600480360381019061023091906108b1565b6106a2565b6040516102429190610ad5565b60405180910390f35b6102536106ae565b6040516102609190610ad5565b60405180910390f35b606030607b60405160240161027f929190610a83565b6040516020818303038152906040527fa9059cbb000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050905090565b600063a9059cbb60e01b905090565b606061031a6103cf565b838360405160240161032d929190610aac565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050905092915050565b60606040518060400160405280601981526020017f7472616e7366657228616464726573732c75696e743235362900000000000000815250905090565b60006040518060400160405280601981526020017f7472616e7366657228616464726573732c75696e74323536290000000000000081525080519060200120905090565b6000806000803073ffffffffffffffffffffffffffffffffffffffff166104386103cf565b878760405160240161044b929190610aac565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040516104b59190610a51565b6000604051808303816000865af19150503d80600081146104f2576040519150601f19603f3d011682016040523d82523d6000602084013e6104f7565b606091505b50915091508061050690610c78565b829350935050509250929050565b816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550806001819055505050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000806000803073ffffffffffffffffffffffffffffffffffffffff1686866040516024016105b3929190610aac565b6040516020818303038152906040527fa9059cbb000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505060405161063d9190610a51565b6000604051808303816000865af19150503d806000811461067a576040519150601f19603f3d011682016040523d82523d6000602084013e61067f565b606091505b50915091508061068e90610c78565b829350935050509250929050565b60015481565b60008235905092915050565b60008030607b6040516024016106c5929190610a83565b6040516020818303038152906040527fa9059cbb000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505090508060008151811061075857610757610d2e565b5b602001015160f81c60f81b8160018151811061077757610776610d2e565b5b602001015160f81c60f81b8260028151811061079657610795610d2e565b5b602001015160f81c60f81b836003815181106107b5576107b4610d2e565b5b602001015160f81c60f81b6040516020016107d39493929190610a03565b6040516020818303038152906040526107eb90610c78565b91505090565b60008135905061080081610da9565b92915050565b60008083601f84011261081c5761081b610d77565b5b8235905067ffffffffffffffff81111561083957610838610d72565b5b60208301915083600182028301111561085557610854610d7c565b5b9250929050565b60008135905061086b81610dc0565b92915050565b6000806040838503121561088857610887610d86565b5b6000610896858286016107f1565b92505060206108a78582860161085c565b9150509250929050565b600080602083850312156108c8576108c7610d86565b5b600083013567ffffffffffffffff8111156108e6576108e5610d81565b5b6108f285828601610806565b92509250509250929050565b61090781610bcb565b82525050565b61091681610bdd565b82525050565b61092d61092882610be9565b610d24565b82525050565b61093c81610c15565b82525050565b600061094d82610b88565b6109578185610b9e565b9350610967818560208601610cf1565b61097081610d8b565b840191505092915050565b600061098682610b88565b6109908185610baf565b93506109a0818560208601610cf1565b80840191505092915050565b6109b581610cdf565b82525050565b60006109c682610b93565b6109d08185610bba565b93506109e0818560208601610cf1565b6109e981610d8b565b840191505092915050565b6109fd81610c61565b82525050565b6000610a0f828761091c565b600182019150610a1f828661091c565b600182019150610a2f828561091c565b600182019150610a3f828461091c565b60018201915081905095945050505050565b6000610a5d828461097b565b915081905092915050565b6000602082019050610a7d60008301846108fe565b92915050565b6000604082019050610a9860008301856108fe565b610aa560208301846109ac565b9392505050565b6000604082019050610ac160008301856108fe565b610ace60208301846109f4565b9392505050565b6000602082019050610aea6000830184610933565b92915050565b6000604082019050610b056000830185610933565b610b12602083018461090d565b9392505050565b60006020820190508181036000830152610b338184610942565b905092915050565b60006020820190508181036000830152610b5581846109bb565b905092915050565b6000602082019050610b7260008301846109f4565b92915050565b6000819050602082019050919050565b600081519050919050565b600081519050919050565b600082825260208201905092915050565b600081905092915050565b600082825260208201905092915050565b6000610bd682610c41565b9050919050565b60008115159050919050565b60007fff0000000000000000000000000000000000000000000000000000000000000082169050919050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600060ff82169050919050565b6000610c8382610b88565b82610c8d84610b78565b9050610c9881610d5d565b92506004821015610cd857610cd37fffffffff0000000000000000000000000000000000000000000000000000000083600403600802610d9c565b831692505b5050919050565b6000610cea82610c6b565b9050919050565b60005b83811015610d0f578082015181840152602081019050610cf4565b83811115610d1e576000848401525b50505050565b6000819050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6000610d698251610c15565b80915050919050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b600082821b905092915050565b610db281610bcb565b8114610dbd57600080fd5b50565b610dc981610c61565b8114610dd457600080fd5b5056fea2646970667358221220c708a19e6d709ba3e31e51f3be90e55bf8059ef4584ef5c15380909191c51f7664736f6c63430008070033";

type CallAnythingConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CallAnythingConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CallAnything__factory extends ContractFactory {
  constructor(...args: CallAnythingConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<CallAnything> {
    return super.deploy(overrides || {}) as Promise<CallAnything>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): CallAnything {
    return super.attach(address) as CallAnything;
  }
  override connect(signer: Signer): CallAnything__factory {
    return super.connect(signer) as CallAnything__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CallAnythingInterface {
    return new utils.Interface(_abi) as CallAnythingInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CallAnything {
    return new Contract(address, _abi, signerOrProvider) as CallAnything;
  }
}
