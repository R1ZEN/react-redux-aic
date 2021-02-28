import { useContext } from 'react';
import { AicInProgressContext } from './context/aic-in-progress-context';

export const useAicInProgress = () => {
  const { inProgress } = useContext(AicInProgressContext);

  if (inProgress === undefined) {
    console.warn(
      'useAicInProgress: You need wrap Root component with <AicProvider>'
    );

    return false;
  }

  return inProgress;
};
