import {
  Event,
  Processor,
  EventPipelineInitialiser,
  EventOfKey
} from "./types";

const isKeyedEvent = <
  TEvent extends Event,
  K extends TEvent['detail-type'],
  E extends EventOfKey<TEvent, K>
>(
  key: K,
  event: TEvent
): event is E => event["detail-type"] === key;

export const initPipeline: EventPipelineInitialiser = (
  initialEvent,
  initialState
) => ({
  step: <K extends (typeof initialEvent)['detail-type']>(
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
      (currentState, chosenFunction) =>
        chosenFunction(initialEvent, currentState).state,
      initialState
    ),
});
