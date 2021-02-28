import { MutableRefObject } from 'react';

export const promiseClosureRef: MutableRefObject<PromiseLike<any>> = {
  current: Promise.resolve(),
};
