import React from 'react';
import { Provider as ProviderMock } from 'react-redux';
import { useAicInProgress } from '../../src';
import { useAicSelector } from '../../src';
import * as rtl from '@testing-library/react';
import { createStore } from 'redux';
import { RequestQueue } from '../../src/request-queue';
import { AicRequestQueueContext } from '../../src/context/aic-request-queue-context';

const createWrapper = (store, requestQueue: RequestQueue) => (props) => (
  <AicRequestQueueContext.Provider value={requestQueue}>
    <ProviderMock store={store}>{props.children}</ProviderMock>
  </AicRequestQueueContext.Provider>
);

const baseReducer = ({ count }: any = { count: -1 }) => ({
  count: count + 1,
});

describe('useAicInProgress', () => {
  let store;
  let requestQueue: RequestQueue;

  beforeEach(() => {
    store = createStore(baseReducer);
    requestQueue = new RequestQueue();
  });

  it('should return correct in progress state when initialization happened', async () => {
    const callback = jest.fn();
    const renderItems = [];
    let renderCount = 0;

    const MockCmp = () => {
      useAicSelector(
        (s) => s,
        () => undefined,
        callback,
        {}
      );
      renderCount += 1;
      renderItems.push(useAicInProgress());

      return <div />;
    };

    rtl.render(<MockCmp />, {
      wrapper: createWrapper(store, requestQueue),
    });

    await rtl.act(async () => {
      await requestQueue.promiseQueue;
    });

    expect(renderCount).toBe(3);
    expect(renderItems).toEqual([false, true, false]);
  });

  it('should return correct in progress state when conditional updates happened', async () => {
    const callback1 = jest.fn(() => {
      return Promise.resolve().then(() => {
        store.getState().count = 0;
        store.dispatch({ type: '' });
      });
    });
    const callback2 = jest.fn();
    const renderItems = [];
    let renderCount = 0;

    const MockCmp = () => {
      const count = useAicSelector(
        (s: any) => s.count,
        () => undefined,
        callback1,
        {}
      );

      useAicSelector(
        () => undefined,
        () => undefined,
        callback2,
        { count }
      );

      renderCount += 1;
      renderItems.push(useAicInProgress());

      return <div />;
    };

    rtl.render(<MockCmp />, {
      wrapper: createWrapper(store, requestQueue),
    });

    await rtl.act(async () => {
      await requestQueue.promiseQueue;
    });

    expect(renderCount).toBe(5);
    expect(renderItems).toEqual([false, true, true, false, false]);
  });
});
