import React from 'react';

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

export function useAicCallbackInProgress(callback: Function): boolean;

export const AicProvider: React.FC;
