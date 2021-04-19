import { useState } from 'react';
import { aicStore } from './utils/aic-store';

export const useAicInProgress = () => {
  const [inProgress, setInProgress] = useState(false);

  aicStore.subscribe(() => {
    const state = aicStore.getState();

    if (state.aicInProgress !== inProgress) {
      setInProgress(state.aicInProgress);
    }
  });

  return inProgress;
};
