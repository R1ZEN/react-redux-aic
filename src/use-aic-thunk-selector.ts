import { useDispatch } from 'react-redux';
import { useAicSelector } from './use-aic-selector';

const cbToThunkMap = new Map();

export const useAicThunkSelector = (
  selector,
  triggerSelector,
  callback,
  callbackParams
) => {
  const dispatch = useDispatch();

  let cb;

  if (cbToThunkMap.has(callback)) {
    cb = cbToThunkMap.get(callback);
  } else {
    cb = (params) => dispatch(callback(params));
    cbToThunkMap.set(callback, cb);
  }

  return useAicSelector(selector, triggerSelector, cb, callbackParams);
};
