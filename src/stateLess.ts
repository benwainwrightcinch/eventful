import { isKeyedEvent } from "./helpers";
import { StateLessApi, Event } from "./types";

export const getStateLessApi = <TEvent extends Event>(
  initialEvent: TEvent
): StateLessApi<TEvent> => ({
  step: (key, processor) => (event) => {
    if (isKeyedEvent(key, event)) {
      processor(key, event);
    }
    return { key };
  },
  execute: (...funcs) => funcs.forEach((func) => func(initialEvent)),
});

