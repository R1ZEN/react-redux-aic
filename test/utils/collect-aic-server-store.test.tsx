import React from 'react';
import { createStore } from 'redux';
import * as hooks from '@testing-library/react-hooks';
import * as rtl from '@testing-library/react';
import { collectAicServerStore } from '../../src/utils/collect-aic-server-store';
import { RequestQueue } from '../../src/request-queue';
import { useAicSelector } from '../../src/use-aic-selector';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useLayoutEffect: jest.requireActual('react').useEffect,
}));

const identity = (s: any) => s;
const undefinedTriggerSelector = () => undefined;
const baseReducer = ({ count }: any = { count: -1 }) => ({
  count: count + 1,
});

describe('collectAicServerStore', () => {
  let store;
  let requestQueue: RequestQueue;

  const incrementCounter = () => store.dispatch({ type: '' });

  beforeEach(() => {
    store = createStore(baseReducer);
    requestQueue = new RequestQueue();
  });

  afterEach(() => {
    rtl.cleanup();
    hooks.cleanup();
  });
  
  it('should collect store if component has useAicSector hooks', async () => {
    const fn1 = jest.fn(incrementCounter);
    let renderCount = 0;
    const triggerSelector = (store) => store.count === 1 ? true : undefined

    const Cmp1 = () => {
      useAicSelector(identity, triggerSelector, fn1, {});
      renderCount += 1;

      return <div />
    }

    expect(store.getState()).toEqual({ count: 0 });

    await rtl.act(async () => {
      await collectAicServerStore(
        {
          store,
          render: () => <Cmp1/>,
        });
    });

    expect(renderCount).toBe(2);
    expect(store.getState()).toEqual({ count: 1 });
  });

  it('should collect store if component has conditional rendering', async () => {
    const fn1 = jest.fn(incrementCounter);

    let renderCount1 = 0;
    let renderCount2 = 0;
    const selectCount = (store) => store.count;
    const triggerSelector1 = (store) => store.count > 1 ? true : undefined;
    const triggerSelector2 = (store) => store.count > 0 ? true : undefined;

    const Cmp1 = () => {
      useAicSelector(identity, triggerSelector1, fn1, {});
      renderCount1 += 1;

      return <div />;
    }

    const Cmp2 = () => {
      const count = useAicSelector(selectCount, triggerSelector2, fn1, {});
      renderCount2 += 1;

      if (count > 0) {
        return <Cmp1 />;
      }

      return <div />
    }

    expect(store.getState()).toEqual({ count: 0 });

    await rtl.act(async () => {
      await collectAicServerStore(
        {
          store,
          render: () => <Cmp2 />,
        });
    });

    expect(renderCount2).toBe(3);
    expect(renderCount1).toBe(2);
    expect(store.getState()).toEqual({ count: 2 });
  });

});
