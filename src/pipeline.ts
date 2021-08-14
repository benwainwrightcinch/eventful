import {
  Event,
  Processor,
  EventOfKey,
  InputFunctionsIfKeysAreExhaustive,
  StateFulProcessor
} from "./types";

const isKeyedEvent = <
  TEvent extends Event,
  K extends TEvent["detail-type"],
  E extends EventOfKey<TEvent, K>
>(
  key: K,
  event: TEvent
): event is E => event["detail-type"] === key;

const isStateFullProcessor = <
  TEvent extends Event,
  K extends TEvent["detail-type"],
  S extends Record<string, unknown> | undefined
>(
  processor: Processor<TEvent, K, S>
): processor is StateFulProcessor<TEvent, K, S> => processor.length > 2

export const initPipeline = <
  TEvent extends Event,
  S extends Record<string, unknown> | undefined
>(
  initialEvent: TEvent,
  initialState?: S
) => ({
  step: <K extends typeof initialEvent["detail-type"]>(
    key: K,
    processor: Processor<TEvent, K, S>
  ) => {
    return (event: TEvent, state?: S) => {
      if (isKeyedEvent(key, event)) {
        if(isStateFullProcessor(processor)) {
          const inputState = state ?? initialState
          if(!inputState) {
            throw new Error('Please supply some initial state when you initialise the pipeline')
          }
          return { key, state: processor(key, event, inputState)};
        }
        processor(key, event)
        return { key, state: undefined};
      }
      return { state, key };
    };
  },

  execute: <K extends TEvent["detail-type"]>(...funcs: InputFunctionsIfKeysAreExhaustive<TEvent, K, S>[]) =>
       funcs.reduce(
          (currentState, chosenFunction) =>
            chosenFunction(initialEvent, currentState).state,
          initialState
        )
});
