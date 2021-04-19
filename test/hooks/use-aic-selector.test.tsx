import React, { memo } from 'react';
import { createStore } from 'redux';
import { Provider as ProviderMock } from 'react-redux';
import * as hooks from '@testing-library/react-hooks';
import * as rtl from '@testing-library/react';
import { useAicSelector } from '../../src/use-aic-selector';
import { AicRequestQueueContext } from '../../src/context/aic-request-queue-context';
import { RequestQueue } from '../../src/request-queue';

const identity = (s: any) => s;
const undefinedTriggerSelector = () => undefined;
const baseReducer = ({ count }: any = { count: -1 }) => ({
  count: count + 1,
});

const createWrapper = (store, requestQueue: RequestQueue) => (props) => (
  <AicRequestQueueContext.Provider value={requestQueue}>
    <ProviderMock {...props} store={store} />
  </AicRequestQueueContext.Provider>
);

describe('useAicSelector', () => {
  let store;
  let requestQueue: RequestQueue;

  beforeEach(() => {
    store = createStore(baseReducer);
    requestQueue = new RequestQueue();
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
          { wrapper: createWrapper(store, requestQueue) }
        );

        await requestQueue.promiseQueue;
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
          wrapper: createWrapper(store, requestQueue),
        });

        await requestQueue.promiseQueue;
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
            wrapper: createWrapper(store, requestQueue),
          }
        );

        await requestQueue.promiseQueue;
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
          { wrapper: createWrapper(store, requestQueue) }
        );

        await requestQueue.promiseQueue;
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
          (store) => store.count === 1 ? true : undefined,
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
          wrapper: createWrapper(store, requestQueue),
        });

        await requestQueue.promiseQueue;
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
          wrapper: createWrapper(store, requestQueue),
        });

        await requestQueue.promiseQueue;
      });

      expect(callback1).toBeCalledTimes(1);
      expect(callback2).toBeCalledTimes(1);
      expect(callback3).toBeCalledTimes(1);
    });

    it('should call callback when selector value changed and triggerSelector return undefined', async () => {
      const cb1 = jest.fn();
      const selector = (state) => state.count;
      let renderCount = 0;

      const MockCmp = () => {
        const count = useAicSelector(selector, undefinedTriggerSelector, cb1, {});
        renderCount += 1;

        return <div />
      };

      await rtl.act(async () => {
        rtl.render(<MockCmp />, {
          wrapper: createWrapper(store, requestQueue),
        });

        await requestQueue.promiseQueue;
      });

      await rtl.act(async () => {
        store.dispatch({ type: '' });

        await requestQueue.promiseQueue;
      });

      expect(renderCount).toBe(2);
      expect(cb1).toBeCalledTimes(2);
    });

    it('should call the next initializer in the current component if the parameter data has been updated', async () => {
      const callback1 = jest.fn(() => {
        // TODO: Figure out why this is 1 but callback called once
        store.getState().count = 0;
        store.dispatch({ type: '' });
      });
      const selector = (state) => state.count;
      const cbArgs = []
      const callback2 = jest.fn((arg) => cbArgs.push(arg));

      const MockCmp = () => {
        const count = useAicSelector(
          selector,
          undefinedTriggerSelector,
          callback1,
          {}
        );
        useAicSelector(identity, undefinedTriggerSelector, callback2, {
          count,
        });

        return <div />;
      };

      await rtl.act(async () => {
        rtl.render(<MockCmp />, {
          wrapper: createWrapper(store, requestQueue),
        });

        await requestQueue.promiseQueue;
      });

      expect(callback2).toBeCalledTimes(2);
      expect(cbArgs.length).toBe(2);
      expect(cbArgs[1]).toEqual({ count: 1 })
    });
  });
});
