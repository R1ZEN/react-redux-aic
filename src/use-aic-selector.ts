import { useContext, useEffect, useRef } from 'react';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import { AicCallbackCollectorContext } from './context/aic-callback-collector-context';
import { AicInProgressContext } from './context/aic-in-progress-context';
import { validateParamsConsistency } from './utils/validate-params-consistency';
import { promiseQueueClosureRef } from './refs/promise-queue-closure-ref';
import { activeEffectClosureRef } from './refs/active-effect-closure-ref';
import { inProgressSetClosureRef } from './refs/in-progress-set-closure-ref';
import { inProgressCountClosureRef } from './refs/in-progress-count-closure-ref';

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
  const prevCallbackParams = useRef(null);
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

  // Params updates
  useEffect(() => {
    if (prevCallbackParams.current === null) {
      prevCallbackParams.current = callbackParams;

      return;
    }

    if (!shallowEqual(callbackParams, prevCallbackParams.current)) {
      prevCallbackParams.current = callbackParams;
      inProgressCountClosureRef.current += 1;

      promiseQueueClosureRef.current = promiseQueueClosureRef.current.then(
        () => {
          if (triggerValue === undefined) {
            inProgressSetClosureRef.current.add(callback);

            return Promise.resolve(callback(callbackParams)).then(() => {
              inProgressSetClosureRef.current.delete(callback);
              inProgressCountClosureRef.current -= 1;
            });
          }
        }
      );

      promiseQueueClosureRef.current = promiseQueueClosureRef.current.then(
        () => {
          if (!inProgressCountClosureRef.current) {
            setInProgress(false);
          }

          return Promise.resolve();
        }
      );
    }
  }, [triggerValue, callbackParams, prevCallbackParams.current]);

  // Initial requests
  useEffect(() => {
    if (markInitializedRef.current) {
      return;
    }

    markInitializedRef.current = true;

    if (activeEffectClosureRef.current !== callback) {
      return;
    }

    activeEffectClosureRef.current = undefined;

    if (!inProgressCountClosureRef.current) {
      setInProgress(true);
    }

    // Transform callback to promise and track progress
    const collectedPromises = Array.from(collectorMap).map(
      ([callback, params]) => {
        inProgressSetClosureRef.current.add(callback);

        inProgressCountClosureRef.current += 1;
        return Promise.resolve(callback(params)).then(() => {
          inProgressSetClosureRef.current.delete(callback);
          inProgressCountClosureRef.current -= 1;
        });
      }
    );

    // Append new promises to in progress promises
    promiseQueueClosureRef.current = promiseQueueClosureRef.current
      .then(() => Promise.all(collectedPromises))
      .then(() => {
        if (!inProgressCountClosureRef.current) {
          setInProgress(false);
        }
      });

    collectorMap.clear();
  }, [markInitializedRef.current, setInProgress, callback, collectorMap]);

  return value;
};
