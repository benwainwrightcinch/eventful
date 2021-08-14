import {
  Event,
  Processor,
  EventOfKey,
  StateFullApi,
  StateLessApi,
  StateFulProcessor,
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
): processor is StateFulProcessor<TEvent, K, S> => processor.length > 2;

const getStateFullApi = <
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

const getStateLessApi = <TEvent extends Event>(
  initialEvent: TEvent
): StateLessApi<TEvent> => ({
  step: (key, processor) => {
    return (event) => {
      if (isKeyedEvent(key, event)) {
        processor(key, event);
        return { key };
      }
      return { key };
    };
  },
  execute: (...funcs) => {
    funcs.forEach((func) => func(initialEvent));
  },
});

export function initPipeline<
  TEvent extends Event,
  S extends Record<string, unknown>
>(initialEvent: TEvent, initialState: S): StateFullApi<TEvent, S>;

export function initPipeline<TEvent extends Event>(
  initialEvent: TEvent
): StateLessApi<TEvent>;

export function initPipeline<
  TEvent extends Event,
  S extends Record<string, unknown>
>(initialEvent: TEvent, initialState?: S) {
  if (initialState) {
    return getStateFullApi(initialEvent, initialState);
  }

  return getStateLessApi(initialEvent);
}
