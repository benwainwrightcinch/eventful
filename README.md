# Eventful (working title)

A type-safe event-bridge processor

## What does it do?

Eventful provides a strongly typed API for narrowing and processing AWS
EventBridge events. You provide an input event which is a union of the
`aws-lambda` build in type `EventBridgeEvent<X, Y>` and it will allow you to
easily supply handler functions for each different event type without narrowing
or casting the types.


## Usage

```TypeScript
import { EventBridgeEvent, Handler } from "aws-lambda";
import { initPipeline, Processor } from "eventful"

interface Car {
  doors: 3 | 5
  model: string
}

interface Train {
  carriages: number
}

interface Scooter {
  model: string
}

const IncomingEvent = EventBridgeEvent<'UpdateCarEvent', Car>
                    | EventBridgeEvent<'UpdateTrainEvent', Train>
                    | EventBridgeEvent<'UpdateScooterEvent', Scooter>

const carProcessor = (key: 'UpdateCarEvent', event: EventBridgeEvent<'UpdateCarEvent', Car>) => {
  // Type is already narrowed for you
  console.log(`The ${event.detail.model} variant has ${event.detail.doors} doors`)

  // Oh, noes! Type Error...
  console.log(`Is this a train with ${event.detail.carriages} carriages?`)
}

/* 
 * more processors :D
 *
 * const trainProcessor = ...
 * const scooterProcessor = ...
 */

export const handler: Handler<IncomingEvent> = (event) => {
  
  const { step, execute } = initPipeline(event);

  execute(
    /*
     * If you mismatch the detail string or the handler
     * you will get a compile error here. You'll also get a
     * compile error if you delete one of the steps below because
     * you are no longer exhaustively processing all the events
     */
    step('UpdateCarEvent', carProcessor),
    step('UpdateTrainEvent', trainProcessor),
    step('UpdateScooterEvent', scooterProcessor)
  )
}

```

## Still to do

* Async processors
