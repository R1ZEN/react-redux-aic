import { MutableRefObject } from 'react';

export const inProgressSetClosureRef: MutableRefObject<Set<Function>> = {
  current: new Set<Function>(),
};
