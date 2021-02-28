# react-redux-aic (Auto initializing component)

## Install

Install from the NPM repository using yarn or npm:

```shell
yarn add react-redux-aic
```

```shell
npm install react-redux-aic
```

## Motivation

In most projects, data requests are made from the nearest common component, but when you need to reuse a component, you have to look for its dependencies in order to repeat the initialization behavior on another page. This library is designed to solve this problem.

## Solution

To solve this problem, it was decided to make a hook that would link data and requests, thus, when transferring the automotic component, requests are launched to initialize the component with server data.

## API

- [useAicSelector](###useaicselector)
- [useAicInProgress](###useaicinprogress)
- [AicProvider](###aicprovider)

### useAicSelector

Allows you to automatically request data and subscribe to it.

```js
const value = useAicSelector(selector, triggerSelector, callback, callbackParams);
```
- `selector` - selector for redux useSelector;
- `triggerSelector` - If triggerSelector returned `undefined` when mounting the component, a callback will be called;
- `callback` - functions that take the first argument of the callbackParam object, required for asynchronous requests to the north and update the redux store;
- `callbackParams` - an object passed to callback as the first argument

### useAicInProgress

Hook that lets you know if the aic is currently working.

> Note: Using only with AicProvider

```js
const inProgress = useAicInProgress();
```

### AicProvider

Allows you to know when the aic starts and stops working.

```jsx
import { AicProvider } from 'react-redux-aic';

// ...
<AicProvider>
  <Component />
</AicProvider>
```

## Example

```jsx
import React from 'react';
import { createStore } from 'redux';
import { useDispatch, Provider } from 'react-redux';
import { useAicSelector } from 'react-redux-aic';

const reducer = (state = {}, action) => ({...state, ...action.state});
const store = createStore(reducer);

const getPost = async ({postId}) => {
  const post = await fetch(`/api/post/${postId}`).then((res) => res.json());
  store.dispatch({state: {post}});
}

const usePostSelector = (field, postId) => {
  return useAicSelector(
    (state) => state.post && state.post[field],
    (state) => state.post,
    getPost,
    {postId}
  );
}

const PostTitle = () => {
  const postId = 123;
  const title = usePostSelector('title', postId);

  if (title === undefined) {
    return <p>Loading...</p>;
  }

  return <h1>Post: {title}</h1>
}

ReactDOM.render(
    <Provider store={store}>
      <PostTitle/>
    </Provider>,
    document.body
);
```

## Dependencies

react, redux, react-redux

