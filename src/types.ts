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
  K extends TEvent["detail-type"],
  S
> = (event: TEvent, state: S) => { key: K; state: S };

type AddFunction<TEvent extends Event, S> = <K extends TEvent["detail-type"]>(
  key: K,
  processor: Processor<TEvent, K, S | undefined>
) => InputFunction<TEvent, K, S | undefined>;

type ProcessorApi<TEvent extends Event, S> = {
  step: AddFunction<TEvent, S>;
  execute: <K extends TEvent["detail-type"]>(
    ...funcs: (Exclude<TEvent["detail-type"], K> extends never
      ? InputFunction<TEvent, K, S | undefined>
      : never)[]
  ) => S | undefined;
};

export interface EventPipelineInitialiser {
  <TEvent extends Event, S>(event: TEvent, state?: S): ProcessorApi<TEvent, S>;
}
