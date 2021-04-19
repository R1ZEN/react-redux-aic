import type { IAicServerOptions } from './src/utils/collect-aic-server-store';

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

export function useAicThunkSelector<
  TState,
  TSelected,
  TTriggerSelected,
  TCallback extends (...args: any[]) => (...args: any[]) => any,
  TCallbackParams
>(
  selector: (state: TState) => TSelected,
  callbackTriggerSelector: (state: TState) => TTriggerSelected,
  callback: TCallback,
  callbackParams: TCallbackParams
): TSelected;

export function useAicInProgress(): boolean;

export function collectAicServerStore(
  options: IAicServerOptions
): Promise<void>;
