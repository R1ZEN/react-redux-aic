import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import { AicRequestQueueContext } from '../context/aic-request-queue-context';
import { RequestQueue } from '../request-queue';

const MAX_DEEP_REQUEST = 10;

export interface IAicServerOptions {
  store: Store;
  render: () => React.ReactElement;
}

export const collectAicServerStore = async (options: IAicServerOptions) => {
  const { store, render } = options;
  const requestQueue = new RequestQueue();

  for (let i = 0; i < MAX_DEEP_REQUEST; i++) {
    ReactDOMServer.renderToStaticMarkup(
      <Provider store={store}>
        <AicRequestQueueContext.Provider value={requestQueue}>
          {render()}
        </AicRequestQueueContext.Provider>
      </Provider>
    );

    if (!requestQueue.collectorMap.size) {
      return;
    }

    await requestQueue.runRequests();
  }
};
