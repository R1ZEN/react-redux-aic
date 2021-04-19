import { createStore } from 'redux';

interface IAicInitialState {
  aicInProgress: boolean
}

const initialState: IAicInitialState = {
  aicInProgress: false
};

const aicReducer = (state: IAicInitialState = initialState, action) => {
  const { type, ...actionOther } = action;

  return { ...state, ...actionOther };
}

export const updateAicInProgress = (aicInProgress: boolean) => {
  return { type: '', aicInProgress }
}

export const aicStore = createStore(aicReducer);