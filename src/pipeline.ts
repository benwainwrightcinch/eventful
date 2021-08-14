import {
  DetailKeys,
  EventOfKey,
  Event,
  Processor,
  EventPipelineInitialiser,
} from "./types";

const isKeyedEvent = <
  TEvent extends Event,
  K extends DetailKeys<TEvent>,
  E extends EventOfKey<TEvent, K>
>(
  key: K,
  event: TEvent
): event is E => event["detail-type"] === key;

export const addProcessor = <
  TEvent extends Event,
  K extends DetailKeys<TEvent>,
  S
>(
  key: K,
  processor: Processor<TEvent, K, S>
) => {
  return (event: TEvent, state: S) => {
    if (isKeyedEvent(key, event)) {
      return { key, state: processor(key, event, state) };
    }
    return { state, key };
  };
};

export const initPipeline: EventPipelineInitialiser = (
  initialEvent,
  initialState
) => ({
  step: <K extends DetailKeys<typeof initialEvent>>(
    key: K,
    processor: Processor<typeof initialEvent, K, typeof initialState>
  ) => {
    return (event: typeof initialEvent, state: typeof initialState) => {
      if (isKeyedEvent(key, event)) {
        return { key, state: processor(key, event, state) };
      }
      return { state, key };
    };
  },
  execute: (...funcs) =>
    funcs.reduce(
      (currentState, chosenFunction) => chosenFunction(initialEvent, currentState).state, initialState
    ),
});
