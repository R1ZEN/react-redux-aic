import { MutableRefObject } from 'react';

export const activeEffectClosureRef: MutableRefObject<undefined | Function> = {
  current: undefined,
};
