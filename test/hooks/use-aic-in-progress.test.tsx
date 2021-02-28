import React from 'react';
import { Provider as ProviderMock } from 'react-redux';
import { AicProvider, useAicInProgress, useAicSelector } from '../../src';
import * as rtl from '@testing-library/react';
import { createStore } from 'redux';
import { promiseClosureRef } from '../../src/promise-closure-ref';
import { inProgressSetClosureRef } from '../../src/in-progress-set-closure-ref';
import { activeEffectClosureRef } from '../../src/active-effect-closure-ref';

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
    promiseClosureRef.current = Promise.resolve();
    inProgressSetClosureRef.current = new Set();
  });

  afterEach(() => rtl.cleanup());

  it('should return true if initialization in progress', async () => {
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

      await promiseClosureRef.current;
    });

    expect(renderItems).toEqual([false, true, false]);
  });
});
