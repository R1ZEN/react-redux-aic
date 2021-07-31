import { useEffect } from 'react';
import { useSelector, useStore } from 'react-redux';
import { aicStoreUpdateCallback } from '../store/aic-store';
import { isServer } from '../is-server';

export const useAicSelector = <
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
) => {
  const store = useStore();
  const value = useSelector(selector);
  const trackValue = callbackTriggerSelector(store.getState());

  if (isServer) {
    aicStoreUpdateCallback(callback, callbackParams);
  }

  useEffect(() => {
    if (trackValue === undefined) {
      aicStoreUpdateCallback(callback, callbackParams);
    }
  });

  return value;
};
