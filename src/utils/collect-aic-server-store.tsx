import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { AicCallbackCollectorContext } from '../context/aic-callback-collector-context';

const MAX_DEEP_REQUEST = 10;

export const collectAicServerStore = async <S extends { dispatch: Function }>(
  Component: React.ComponentType,
  store: S
) => {
  const requestMap = new Map();

  for (let i = 0; i < MAX_DEEP_REQUEST; i++) {
    ReactDOMServer.renderToStaticMarkup(
      <AicCallbackCollectorContext.Provider value={requestMap}>
        <Component />
      </AicCallbackCollectorContext.Provider>
    );

    if (!requestMap.size) {
      return;
    }

    await Promise.all(
      Array.from(requestMap.keys()).map((service) => {
        return store.dispatch({ service, ...requestMap.get(service) });
      })
    );

    requestMap.clear();
  }
};
