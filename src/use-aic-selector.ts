import { useContext, useEffect, useRef } from 'react';
import { useSelector, useStore } from 'react-redux';
import { AicCallbackCollectorContext } from './context/aic-callback-collector-context';
import { AicInProgressContext } from './context/aic-in-progress-context';
import { validateParamsConsistency } from './utils/validate-params-consistency';
import { promiseClosureRef } from './promise-closure-ref';
import { activeEffectClosureRef } from './active-effect-closure-ref';
import { inProgressSetClosureRef } from './in-progress-set-closure-ref';

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
  const collectorMap = useContext(AicCallbackCollectorContext);
  const { setInProgress } = useContext(AicInProgressContext);
  const store = useStore();
  const value = useSelector(selector);
  const markInitializedRef = useRef(false);
  const triggerValue = callbackTriggerSelector(store.getState());

  if (process.env.NODE_ENV !== 'production' && collectorMap.has(callback)) {
    validateParamsConsistency(collectorMap.get(callback), callbackParams);
  }

  if (
    !inProgressSetClosureRef.current.has(callback) &&
    !collectorMap.has(callback) &&
    triggerValue === undefined
  ) {
    if (!activeEffectClosureRef.current) {
      activeEffectClosureRef.current = callback;
    }

    collectorMap.set(callback, callbackParams);
  }

  useEffect(() => {
    if (markInitializedRef.current) {
      return;
    }

    markInitializedRef.current = true;

    if (activeEffectClosureRef.current !== callback) {
      return;
    }

    activeEffectClosureRef.current = undefined;

    if (!inProgressSetClosureRef.current.size) {
      setInProgress(true);
    }

    // Transform callback to promise and track progress
    const collectedPromises = Array.from(collectorMap).map(
      ([callback, params]) => {
        inProgressSetClosureRef.current.add(callback);

        return Promise.resolve(callback(params)).then(() => {
          inProgressSetClosureRef.current.delete(callback);
        });
      }
    );

    // Append new promises to in progress promises
    promiseClosureRef.current = promiseClosureRef.current
      .then(() => Promise.all(collectedPromises))
      .then(() => {
        if (!inProgressSetClosureRef.current.size) {
          setInProgress(false);
        }

        return Promise.resolve();
      });

    collectorMap.clear();
  }, [
    activeEffectClosureRef.current,
    inProgressSetClosureRef.current.size,
    promiseClosureRef.current,
    markInitializedRef.current,
    setInProgress,
    callback,
    collectorMap,
  ]);

  return value;
};
