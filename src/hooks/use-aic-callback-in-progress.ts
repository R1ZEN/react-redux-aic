import { useEffect, useState } from 'react';
import { aicStore } from '../store/aic-store';

export const useAicCallbackInProgress = <TCallback extends Function>(
  callback: TCallback
) => {
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    const unsubscribe = aicStore.subscribe(() => {
      const { requestMap, requestInProgress } = aicStore.getState();

      if (requestMap.has(callback) && requestInProgress) {
        setInProgress(true);
      } else if (
        inProgress &&
        !requestMap.has(callback) &&
        !requestInProgress
      ) {
        setInProgress(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return inProgress;
};
