import { MutableRefObject } from 'react';

export const promiseQueueClosureRef: MutableRefObject<PromiseLike<any>> = {
  current: Promise.resolve(),
};
