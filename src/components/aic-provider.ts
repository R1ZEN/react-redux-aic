import React, { useCallback, useLayoutEffect } from 'react';
import {
  aicStore,
  aicStoreCleanCallbacks,
  aicStoreUpdateInProgress,
} from '../store/aic-store';
import { isServer } from '../is-server';

// @ts-ignore
export const AicProvider: React.FC = ({ children }) => {
  const subscribe = useCallback(async () => {
    const { requestMap, requestInProgress } = aicStore.getState();

    if (requestInProgress || !requestMap.size) {
      return;
    }

    const promiseList = [];
    requestMap.forEach((callbackParams, callback) => {
      promiseList.push(Promise.resolve().then(() => callback(callbackParams)));
    });

    aicStoreCleanCallbacks();

    aicStoreUpdateInProgress(true);

    await Promise.all(promiseList);

    aicStoreUpdateInProgress(false);
  }, []);

  if (!isServer) {
    useLayoutEffect(() => {
      const unsubscribe = aicStore.subscribe(subscribe);

      return () => {
        unsubscribe();
      };
    }, []);
  }

  return children;
};
