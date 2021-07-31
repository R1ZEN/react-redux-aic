import { createStore } from 'redux';

export const AIC_STORE_CLEAR_MAP = 'AIC_STORE_CLEAR_MAP';
export const AIC_STORE_UPDATE_MAP = 'AIC_STORE_UPDATE_MAP';
export const AIC_STORE_UPDATE_IN_PROGRESS = 'AIC_STORE_UPDATE_IN_PROGRESS';

const initialState = {
  requestMap: new Map(),
  requestInProgress: false,
};

export const aicStore = createStore((state, action) => {
  // @ts-ignore
  if (action.type === AIC_STORE_UPDATE_MAP) {
    // @ts-ignore
    state.requestMap.set(action.callback, action.params);

    return { ...state };
  }

  if (action.type === AIC_STORE_CLEAR_MAP) {
    state.requestMap.clear();

    return { ...state };
  }

  if (action.type === AIC_STORE_UPDATE_IN_PROGRESS) {
    // @ts-ignore
    state.requestInProgress = action.value;

    return { ...state };
  }

  return state;
}, initialState);

export const aicStoreUpdateCallback = <TCallback extends Function, TParams>(
  callback: TCallback,
  params: TParams
) => {
  aicStore.dispatch({ type: AIC_STORE_UPDATE_MAP, callback, params });
};

export const aicStoreCleanCallbacks = () => {
  aicStore.dispatch({ type: AIC_STORE_CLEAR_MAP });
};

export const aicStoreUpdateInProgress = (value: boolean) => {
  aicStore.dispatch({ type: AIC_STORE_UPDATE_IN_PROGRESS, value });
};
