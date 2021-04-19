import type { ReactElement } from 'react';

export type AicProvider = ReactElement;

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

export function collectAicServerStore<S extends { dispatch: Function }>(
  store: S,
  renderCallback: (store: S) => ReactElement,
): Promise<void>;
