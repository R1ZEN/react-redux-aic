import { useContext, useEffect } from 'react';
import { useSelector, useStore } from 'react-redux';
import { AicRequestQueueContext } from './context/aic-request-queue-context';

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
  const requestQueue = useContext(AicRequestQueueContext);
  const store = useStore();
  const value = useSelector(selector);
  const triggerValue = callbackTriggerSelector(store.getState());

  if (triggerValue === undefined) {
    requestQueue.addCallback(callback, callbackParams);
  } else {
    requestQueue.removeCallback(callback);
  }

  // Initial requests
  useEffect(() => {
    if (!requestQueue.inProgress) {
      requestQueue.runRequests();
    }
  }, [value]);

  return value;
};
