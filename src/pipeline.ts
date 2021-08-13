import { EventBridgeEvent } from 'aws-lambda'

interface Thing {
  foo: string
}

interface Thing2 {
  bar: string
}

interface Thing3 {
  baz: string
}

type IncomingEvent =
  | EventBridgeEvent<'foo', Thing>
  | EventBridgeEvent<'anotherEvent', Thing2>
  | EventBridgeEvent<'event', Thing3>

type DetailKeys<T> = T extends EventBridgeEvent<infer K, unknown> ? K : never

type EventOfKey<TEvent extends IncomingEvent, TKey extends DetailKeys<TEvent>> = TEvent extends { 'detail-type': TKey }
  ? TEvent
  : never

type Processor<K extends DetailKeys<IncomingEvent>> = <E extends EventOfKey<IncomingEvent, K>, S>(
  key: K,
  event: E,
  state?: S,
) => S | undefined

const isKeyedEvent = <K extends DetailKeys<IncomingEvent>, E extends EventOfKey<IncomingEvent, K>>(
  key: K,
  event: IncomingEvent,
): event is E => event['detail-type'] === key

const buildEventPipeline = <K extends IncomingEvent['detail-type'], S>(key: K, processor: Processor<K>) => {
  return (event: IncomingEvent, state?: S) => {
    if (isKeyedEvent(key, event)) {
      return { key, state: processor(key, event, state) }
    }
    return { state, key }
  }
}

type InputFunction<K extends IncomingEvent['detail-type'], S> = (
  event: IncomingEvent,
  state?: S,
) => { key: K; state: S }

const buildPipeline =
  <K extends IncomingEvent['detail-type'], S = undefined>(
    ...funcs: (Exclude<IncomingEvent['detail-type'], K> extends never ? InputFunction<K, S> : never)[]
  ) =>
  (event: IncomingEvent, state?: S): S | undefined =>
    funcs.reduce((accum, current) => (state ? current(event, accum).state : undefined), state)

const foo = (key: 'foo', event: EventBridgeEvent<'foo', Thing>) => undefined
const bar = (key: 'anotherEvent', event: EventBridgeEvent<'anotherEvent', Thing2>) => undefined

const validationPipeline = buildPipeline(
  buildEventPipeline('foo', foo),
  buildEventPipeline('anotherEvent', bar),
  buildEventPipeline(''),
)

const
