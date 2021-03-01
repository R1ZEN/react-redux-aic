import React from 'react';
import { createStore } from 'redux';
import { Provider as ProviderMock } from 'react-redux';
import * as hooks from '@testing-library/react-hooks';
import * as rtl from '@testing-library/react';
import { AicProvider, useAicSelector } from '../../src';
import { promiseQueueClosureRef } from '../../src/refs/promise-queue-closure-ref';
import { activeEffectClosureRef } from '../../src/refs/active-effect-closure-ref';
import { inProgressSetClosureRef } from '../../src/refs/in-progress-set-closure-ref';

const identity = (s: any) => s;
const undefinedTriggerSelector = () => undefined;
const baseReducer = ({ count }: any = { count: -1 }) => ({
  count: count + 1,
});

const createWrapper = (store) => (props) => (
  <AicProvider>
    <ProviderMock {...props} store={store} />
  </AicProvider>
);

describe('useAicSelector', () => {
  let store;

  beforeEach(() => {
    store = createStore(baseReducer);
    activeEffectClosureRef.current = undefined;
    promiseQueueClosureRef.current = Promise.resolve();
    inProgressSetClosureRef.current = new Set();
  });

  afterEach(() => {
    rtl.cleanup();
    hooks.cleanup();
  });

  describe('subscription behaviour', () => {
    it('should select store value and rerender component when value changed', () => {
      const valueSelector = (s: any) => s.count;
      const callback = jest.fn();
      const callbackParams = {};

      const hookFn = () =>
        useAicSelector(
          valueSelector,
          undefinedTriggerSelector,
          callback,
          callbackParams
        );

      const { result } = hooks.renderHook(hookFn, {
        wrapper: (props) => <ProviderMock {...props} store={store} />,
      });

      expect(result.current).toEqual(0);

      hooks.act(() => {
        store.dispatch({ type: '' });
      });

      expect(result.current).toEqual(1);
    });
  });

  describe('initialization behaviour', () => {
    it('should call callback with params', async () => {
      const callback = jest.fn();
      const params = { foo: 'bar' };

      await hooks.act(async () => {
        hooks.renderHook(
          () =>
            useAicSelector(
              identity,
              undefinedTriggerSelector,
              callback,
              params
            ),
          { wrapper: createWrapper(store) }
        );

        await promiseQueueClosureRef.current;
      });

      expect(callback).toHaveBeenCalledWith(params);
    });

    it('should call callback once if some useAicSelector calls with same callback', async () => {
      const callback = jest.fn();

      const MockCmp = () => {
        useAicSelector(identity, undefinedTriggerSelector, callback, {});
        useAicSelector(identity, undefinedTriggerSelector, callback, {});
        useAicSelector(identity, undefinedTriggerSelector, callback, {});

        return <div />;
      };

      await rtl.act(async () => {
        rtl.render(<MockCmp />, {
          wrapper: createWrapper(store),
        });

        await promiseQueueClosureRef.current;
      });

      expect(callback).toBeCalledTimes(1);
    });

    it('should call callback when triggerSelector return undefined value', async () => {
      const callback = jest.fn();

      await hooks.act(async () => {
        hooks.renderHook(
          () =>
            useAicSelector(identity, undefinedTriggerSelector, callback, {}),
          {
            wrapper: createWrapper(store),
          }
        );

        await promiseQueueClosureRef.current;
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not call callback if triggerSelector return non undefined value', async () => {
      const callback = jest.fn();
      const triggerSelector = () => false;
      const params = { foo: 'bar' };

      await hooks.act(async () => {
        hooks.renderHook(
          () => useAicSelector(identity, triggerSelector, callback, params),
          { wrapper: createWrapper(store) }
        );

        await promiseQueueClosureRef.current;
      });

      expect(callback).toHaveBeenCalledTimes(0);
    });

    it('should call children initializers if parent initialization complete', async () => {
      const callback1 = jest.fn(() => {
        store.dispatch({ type: '' });
      });
      const callback2 = jest.fn();
      const selector = (store) => store.count;

      const MockCmp1 = () => {
        useAicSelector(identity, undefinedTriggerSelector, callback2, {});

        return <div />;
      };

      const MockCmp2 = () => {
        const count = useAicSelector(
          selector,
          undefinedTriggerSelector,
          callback1,
          {}
        );

        if (count === 1) {
          return <MockCmp1 />;
        }

        return <div />;
      };

      await rtl.act(async () => {
        rtl.render(<MockCmp2 />, {
          wrapper: createWrapper(store),
        });

        await promiseQueueClosureRef.current;
      });

      expect(callback1).toBeCalledTimes(1);
      expect(callback2).toBeCalledTimes(1);
    });

    it('should call children initializer when children mounts but parent initialization in progress', async () => {
      const callback1 = jest.fn(() => {
        // TODO: Figure out why this is 1 but callback called once
        store.getState().count = 0;
        store.dispatch({ type: '' });
      });
      const callback2 = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      const callback3 = jest.fn();
      const selector = (store) => store.count;

      const MockCmp1 = () => {
        useAicSelector(identity, undefinedTriggerSelector, callback3, {});

        return <div />;
      };

      const MockCmp2 = () => {
        const count = useAicSelector(
          selector,
          undefinedTriggerSelector,
          callback1,
          {}
        );

        useAicSelector(selector, undefinedTriggerSelector, callback2, {});

        if (count === 1) {
          return <MockCmp1 />;
        }

        return <div />;
      };

      await rtl.act(async () => {
        rtl.render(<MockCmp2 />, {
          wrapper: createWrapper(store),
        });

        await promiseQueueClosureRef.current;
      });

      expect(callback1).toBeCalledTimes(1);
      expect(callback2).toBeCalledTimes(1);
      expect(callback3).toBeCalledTimes(1);
    });

    it('should call the next initializer in the current component if the parameter data has been updated', async () => {
      const callback1 = jest.fn(() => {
        // TODO: Figure out why this is 1 but callback called once
        store.getState().count = 0;
        store.dispatch({ type: '' });
      });
      const callback2 = jest.fn();

      const MockCmp = () => {
        const count = useAicSelector(
          identity,
          undefinedTriggerSelector,
          callback1,
          {}
        );
        useAicSelector(identity, undefinedTriggerSelector, callback2, {
          count
        });

        return <div />;
      };

      await rtl.act(async () => {
        rtl.render(<MockCmp />, {
          wrapper: createWrapper(store),
        });

        await promiseQueueClosureRef.current;
      });

      expect(callback2).toBeCalledTimes(2);
    });
  });

  describe('validation', () => {
    it('should throw consistency error if same callback calling with different params', () => {
      const callback = jest.fn();
      const params1 = { foo: 'bar' };
      const params2 = { bar: 'foo' };

      const MockCmp = () => {
        useAicSelector(identity, undefinedTriggerSelector, callback, params1);
        useAicSelector(identity, undefinedTriggerSelector, callback, params2);

        return <div />;
      };

      spyOn(console, 'error');

      expect(() => {
        rtl.render(<MockCmp />, { wrapper: createWrapper(store) });
      }).toThrowError(/^useAicSelector:\sConsistency\serror\./);
    });
  });
});
