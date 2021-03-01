import React from 'react';
import { Provider as ProviderMock } from 'react-redux';
import { AicProvider, useAicInProgress, useAicSelector } from '../../src';
import * as rtl from '@testing-library/react';
import { createStore } from 'redux';
import { promiseQueueClosureRef } from '../../src/refs/promise-queue-closure-ref';
import { inProgressSetClosureRef } from '../../src/refs/in-progress-set-closure-ref';
import { activeEffectClosureRef } from '../../src/refs/active-effect-closure-ref';

const createWrapper = (store) => (props) => (
  <ProviderMock store={store}>{props.children}</ProviderMock>
);

const baseReducer = ({ count }: any = { count: -1 }) => ({
  count: count + 1,
});

describe('useAicInProgress', () => {
  let store;

  beforeEach(() => {
    store = createStore(baseReducer);
    activeEffectClosureRef.current = undefined;
    promiseQueueClosureRef.current = Promise.resolve();
    inProgressSetClosureRef.current = new Set();
  });

  afterEach(() => rtl.cleanup());

  it('should return correct in progress state when initialization happened', async () => {
    const callback = jest.fn();
    const renderItems = [];

    const MockCmp = () => {
      useAicSelector(
        (s) => s,
        () => undefined,
        callback,
        {}
      );
      renderItems.push(useAicInProgress());

      return <div />;
    };

    await rtl.act(async () => {
      rtl.render(
        <AicProvider>
          <MockCmp />
        </AicProvider>,
        {
          wrapper: createWrapper(store),
        }
      );

      await promiseQueueClosureRef.current;
    });

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

      renderItems.push(useAicInProgress());

      return <div />;
    };

    await rtl.act(async () => {
      rtl.render(
        <AicProvider>
          <MockCmp />
        </AicProvider>,
        {
          wrapper: createWrapper(store),
        }
      );

      await promiseQueueClosureRef.current;
    });

    expect(renderItems).toEqual([false, true, true, false]);
  });
});
