import { createContext } from 'react';

let inProgress: undefined | boolean;

const setInProgress = (value: boolean) => {
  inProgress = value;
};

interface IAicInProgressContext {
  inProgress: undefined | boolean;
  setInProgress: (value: boolean) => void;
}

export const AicInProgressContext = createContext<IAicInProgressContext>({
  inProgress,
  setInProgress,
});
