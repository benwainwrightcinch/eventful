import { EventBridgeEvent } from 'aws-lambda'

export type Event = EventBridgeEvent<string, any>

export type DetailKeys<T> = T extends EventBridgeEvent<infer K, unknown> ? K : never

export type EventOfKey<TEvent extends Event, TKey extends DetailKeys<TEvent>> = TEvent extends { 'detail-type': TKey }
  ? TEvent
  : never

export type NotFunction<T> = T extends Function ? never : T

export interface Processor<TEvent extends Event, K extends DetailKeys<TEvent>> {
  <E extends EventOfKey<TEvent, K>, S>(key: K, event: E, state: S):  S
  <E extends EventOfKey<TEvent, K>>(key: K, event: E): void 
}

export type InputFunction<TEvent extends Event, K extends DetailKeys<TEvent>, S> = (
  event: TEvent,
  state: S,
) => { key: K; state: S }

export type KeyedEventGuard = <TEvent extends Event, K extends DetailKeys<TEvent>, E extends EventOfKey<TEvent, K>>(key: K, event: TEvent) => event is E

export interface EventProcessor {
  <TEvent extends Event, K extends DetailKeys<TEvent>,  S>(
    event: TEvent,
    state: S,
    ...funcs: (Exclude<DetailKeys<TEvent>, K> extends never ? InputFunction<TEvent, K, S> : never)[]): S | undefined

  <TEvent extends Event, K extends DetailKeys<TEvent>,  S>(
    event: TEvent,
    ...funcs: (Exclude<DetailKeys<TEvent>, K> extends never ? InputFunction<TEvent, K, S> : never)[]): S | undefined
}

