import { EventBridgeEvent } from "aws-lambda";
import { mock } from "jest-mock-extended"
import { initPipeline } from "./pipeline"

interface Thing {
  foo: string;
}

interface Thing2 {
  bar: string;
}

interface Thing3 {
  baz: string;
}

type IncomingEvent =
  | EventBridgeEvent<"foo", Thing>
  | EventBridgeEvent<"fo2o", Thing>
  | EventBridgeEvent<"anotherEvent", Thing2>
  | EventBridgeEvent<"event", Thing3>;

describe("the event pipeline builder", () => {
  it("executes the correct handler", () => {

    const mockEvent: IncomingEvent= {
      id: '123',
      version: 'a',
      account: 'a',
      time: 'a',
      region: 'a',
      resources: ['a'],
      source: 'a',
      'detail-type': 'anotherEvent',
      detail: {
        bar: 'foo'
      }
    }


    const handlerOne = (key: 'foo', event: EventBridgeEvent<'foo', Thing>) => fail('Handler one was not supposed to be called')
    const handlerTwo = (key: 'fo2o', event: EventBridgeEvent<'fo2o', Thing>) => fail('Handler two was not supposed to be called')
    const handlerThree = (key: 'anotherEvent', event: EventBridgeEvent<'anotherEvent', Thing2>) => expect(event).toBe(mockEvent)
    const handlerFour = (key: 'event', event: EventBridgeEvent<'event', Thing3>) => fail('Handler four was not supposed to be called')

    const initialState = { foo: "bar" };

    const { execute, step } = initPipeline(mockEvent as IncomingEvent)

    execute(
      step('foo', handlerOne),
      step('fo2o', handlerTwo),
      step('anotherEvent', handlerThree),
      step('event', handlerFour)
    )

    expect.assertions(1)
  })
});
