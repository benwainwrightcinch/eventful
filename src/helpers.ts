import { EventOfKey, Event } from "./types";

export const isKeyedEvent = <
  TEvent extends Event,
  K extends TEvent["detail-type"],
  E extends EventOfKey<TEvent, K>
>(
  key: K,
  event: TEvent
): event is E => event["detail-type"] === key;

