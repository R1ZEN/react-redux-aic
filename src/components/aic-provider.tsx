import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { AicInProgressContext } from '../context/aic-in-progress-context';

export const AicProvider: React.FC = ({ children }) => {
  const [inProgress, setInProgress] = useState(false);

  return (
    <AicInProgressContext.Provider value={{ inProgress, setInProgress }}>
      {children}
    </AicInProgressContext.Provider>
  );
};
