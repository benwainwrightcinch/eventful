import { DetailKeys, EventOfKey, Event, Processor, EventProcessor, InputFunction } from "./types"

const isKeyedEvent = <TEvent extends Event, K extends DetailKeys<TEvent>, E extends EventOfKey<TEvent, K>>(
  key: K,
  event: TEvent,
): event is E => event['detail-type'] === key

export const addProcessor = <TEvent extends Event, K extends DetailKeys<TEvent>>(key: K, processor: Processor<TEvent, K>) => {
  return <S>(event: TEvent, state: S) => {
    if (isKeyedEvent(key, event)) {
      return { key, state: processor(key, event, state) }
    }
    return { state, key }
  }
}

const isFunction = (thing: unknown): thing is Function => typeof thing === 'function'

export const processEvent: EventProcessor =
  (event, secondArg, ...args) => {
    const funcs = isFunction(secondArg) ? [secondArg, ...args] : args
    const state = isFunction(secondArg) ? undefined : secondArg
    return funcs.reduce((accum, current) => (accum ? current(event, accum).state : undefined), state)
}
