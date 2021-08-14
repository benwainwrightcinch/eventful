import { getStateFullApi } from "./stateFull";
import { getStateLessApi } from "./stateLess";

import {
  Event,
  StateFullApi,
  StateLessApi,
} from "./types";

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
