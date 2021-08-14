import { EventBridgeEvent } from "aws-lambda";

export type Event = EventBridgeEvent<string, any>;

type EventsTypeMap<TEvent extends Event> = {
  [K in TEvent["detail-type"]]: TEvent extends EventBridgeEvent<K, infer D>
    ? D
    : never;
};

export type EventOfKey<
  TEvent extends Event,
  TKey extends TEvent["detail-type"]
> = TEvent extends { "detail-type": TKey } ? TEvent : never;

export interface StateFulProcessor<
  TEvent extends Event,
  K extends TEvent["detail-type"],
  S extends Record<string, unknown> | undefined
> {
  (key: K, event: EventBridgeEvent<K, EventsTypeMap<TEvent>[K]>, state: S): S;
}

export interface StateLessProcessor<
  TEvent extends Event,
  K extends TEvent["detail-type"]
> {
  (key: K, event: EventBridgeEvent<K, EventsTypeMap<TEvent>[K]>): void;
}

export type Processor<
  TEvent extends Event,
  K extends TEvent["detail-type"],
  S extends Record<string, unknown> | undefined
> = StateFulProcessor<TEvent, K, S> | StateLessProcessor<TEvent, K>;

export type InputFunction<
  TEvent extends Event,
  K extends TEvent["detail-type"],
  S extends Record<string, unknown> | undefined
> = (event: TEvent, state: S) => { key: K; state: S };

export type StateLessInputFunction<
  TEvent extends Event,
  K extends TEvent["detail-type"],
> = (event: TEvent) => { key: K };

export type InputFunctionsIfKeysAreExhaustive<
  F extends Function,
  TEvent extends Event,
  K extends TEvent["detail-type"],
> = Exclude<TEvent["detail-type"], K> extends never
  ? F
  : never;

export interface StateFullApi<
  TEvent extends Event,
  S extends Record<string, unknown>
> {
  step: <K extends TEvent["detail-type"]>(
    key: K,
    processor: Processor<TEvent, K, S>
  ) => InputFunction<TEvent, K, S>;
  execute: <K extends TEvent["detail-type"]>(
    ...funcs: InputFunctionsIfKeysAreExhaustive<InputFunction<TEvent, K, S>, TEvent, K>[]
  ) => S;
}

export interface StateLessApi<TEvent extends Event> {
  step: <K extends TEvent["detail-type"]>(
    key: K,
    processor: StateLessProcessor<TEvent, K>
  ) => StateLessInputFunction<TEvent, K>;
  execute: <K extends TEvent["detail-type"]>(
    ...funcs: InputFunctionsIfKeysAreExhaustive<StateLessInputFunction<TEvent, K>, TEvent, K>[]
  ) => void;
}
