import { EventBridgeEvent } from "aws-lambda";

export type Event = EventBridgeEvent<string, any>;

export type DetailKeys<T> = T extends EventBridgeEvent<infer K, any>
  ? K
  : never;
export type Detail<T> = T extends EventBridgeEvent<string, infer D> ? D : never;

type EventsTypeMap<TEvent extends Event> = {
  [K in TEvent["detail-type"]]: TEvent extends EventBridgeEvent<K, infer D>
    ? D
    : never;
};

export type EventOfKey<
  TEvent extends Event,
  TKey extends TEvent["detail-type"]
> = TEvent extends { "detail-type": TKey } ? TEvent : never;

export type RightEvent<
  TEvent extends Event,
  K extends string,
  P extends (key: K, event: any) => any
> = P extends (key: K, event: infer E) => any
  ? E extends EventBridgeEvent<K, infer D>
    ? D extends EventsTypeMap<TEvent>[K]
      ? P
      : never
    : never
  : never;

export interface Processor<
  TEvent extends Event,
  K extends TEvent["detail-type"],
  S
> {
  (key: K, event: EventBridgeEvent<K, EventsTypeMap<TEvent>[K]>, state: S): S;
  (key: K, event: EventBridgeEvent<K, EventsTypeMap<TEvent>[K]>): void;
}

export type InputFunction<
  TEvent extends Event,
  K extends DetailKeys<TEvent>,
  S
> = (event: TEvent, state: S) => { key: K; state: S };

export type KeyedEventGuard = <
  TEvent extends Event,
  K extends DetailKeys<TEvent>,
  E extends EventOfKey<TEvent, K>
>(
  key: K,
  event: TEvent
) => event is E;

type AddFunction<TEvent extends Event, S> = <K extends DetailKeys<TEvent>>(
  key: K,
  processor: Processor<TEvent, K, S | undefined>
) => InputFunction<TEvent, K, S | undefined>;

type ProcessorApi<TEvent extends Event, S> = {
  step: AddFunction<TEvent, S>;
  execute: <K extends DetailKeys<TEvent>>(
    ...funcs: (Exclude<DetailKeys<TEvent>, K> extends never
      ? InputFunction<TEvent, K, S | undefined>
      : never)[]
  ) => S | undefined;
};

export interface EventPipelineInitialiser {
  <TEvent extends Event, S>(event: TEvent, state?: S): ProcessorApi<TEvent, S>;
}
