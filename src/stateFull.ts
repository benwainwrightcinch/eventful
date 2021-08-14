import { isKeyedEvent } from "./helpers";
import { Processor, StateFulProcessor, Event, StateFullApi } from "./types";

export const isStateFullProcessor = <
  TEvent extends Event,
  K extends TEvent["detail-type"],
  S extends Record<string, unknown> | undefined
>(
  processor: Processor<TEvent, K, S>
): processor is StateFulProcessor<TEvent, K, S> => processor.length > 2;

export const getStateFullApi = <
  TEvent extends Event,
  S extends Record<string, unknown>
>(
  initialEvent: TEvent,
  initialState: S
): StateFullApi<TEvent, S> => ({
  step: (key, processor) => {
    return (event, state) => {
      if (isKeyedEvent(key, event)) {
        const inputState = state ?? initialState;
        if (isStateFullProcessor(processor)) {
          if (!inputState) {
            throw new Error(
              "Please supply some initial state when you initialise the pipeline"
            );
          }
          return { key, state: processor(key, event, inputState) };
        }
        processor(key, event);
        return { key, state: inputState };
      }
      return { state, key };
    };
  },

  execute: (...funcs) => {
    const result = funcs.reduce(
      (currentState, chosenFunction) =>
        chosenFunction(initialEvent, currentState).state ?? currentState,
      initialState
    );

    if (initialState && result) {
      return result;
    }

    return initialState;
  },
});
