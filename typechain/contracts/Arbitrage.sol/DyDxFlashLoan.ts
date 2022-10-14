/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";

export interface DyDxFlashLoanInterface extends utils.Interface {
  functions: {
    "WETH()": FunctionFragment;
    "currencies(address)": FunctionFragment;
    "tokenToMarketId(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "WETH" | "currencies" | "tokenToMarketId"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "WETH", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "currencies",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenToMarketId",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(functionFragment: "WETH", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "currencies", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "tokenToMarketId",
    data: BytesLike
  ): Result;

  events: {};
}

export interface DyDxFlashLoan extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: DyDxFlashLoanInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    WETH(overrides?: CallOverrides): Promise<[string]>;

    currencies(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    tokenToMarketId(
      token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;
  };

  WETH(overrides?: CallOverrides): Promise<string>;

  currencies(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  tokenToMarketId(
    token: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    WETH(overrides?: CallOverrides): Promise<string>;

    currencies(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tokenToMarketId(
      token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    WETH(overrides?: CallOverrides): Promise<BigNumber>;

    currencies(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tokenToMarketId(
      token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    WETH(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    currencies(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tokenToMarketId(
      token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}