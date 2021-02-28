export type AicProvider = import('react').FC;

export function useAicSelector<
  TState,
  TSelected,
  TTriggerSelected,
  TCallback extends Function,
  TCallbackParams
>(
  selector: (state: TState) => TSelected,
  callbackTriggerSelector: (state: TState) => TTriggerSelected,
  callback: TCallback,
  callbackParams: TCallbackParams
): TSelected;

export function useAicInProgress(): boolean;
