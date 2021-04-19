# react-redux-aic

Wrapper for redux `useSelector` that allows automatically initialize component with server data.

## Install

Install from the NPM repository using yarn or npm:

```shell
yarn add --dev @pbe/react-redux-aic
```

```shell
npm install -D @pbe/react-redux-aic
```

## Motivation

In most projects, data requests are made from the nearest common component, but when you need to reuse a component, you have to look for its dependencies in order to repeat the initialization behavior on another page. This library is designed to solve this problem.

## Solution

To solve this problem, it was decided to make a hook that would link data and requests, thus, when transferring the automotic component, requests are launched to initialize the component with server data.

## API

- [Hooks](#hooks)
  - [useAicSelector](#useaicselector)
  - [useAicThunkSelector](#useaicthunkselector)
  - [useAicInProgress](#useaicinprogress)

## Hooks

### useAicSelector

Allows you to automatically request data and subscribe to it.

```js
const value = useAicSelector(selector, triggerSelector, callback, callbackParams);
```
- `selector` - selector for redux useSelector;
- `triggerSelector` - If triggerSelector returned `undefined` when mounting the component, a callback will be called;
- `callback` - functions that take the first argument of the callbackParam object, required for asynchronous requests to the north and update the redux store;
- `callbackParams` - an object passed to callback as the first argument

### useAicThunkSelector

Same as `useAicSelector` but with `thunk` instead of callback.

```js
const value = useAicThunkSelector(selector, triggerSelector, thunk, thunkParams);
```

### useAicInProgress

Hook that lets you know if the aic is currently working.

```js
const inProgress = useAicInProgress();
```

## Example

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import { useAicThunkSelector } from '@pbe/react-redux-aic';
import thunk from 'redux-thunk';

const reducer = (state = {}, action) => ({ ...state, ...action.state });
const store = createStore(reducer, applyMiddleware(thunk));

const getPost = ({ postId }) => {
  return async (dispatch) => {
    const post = await fetch(`/api/post/${postId}.json`).then((res) =>
      res.json()
    );
    dispatch({ type: '', state: { post } });
  };
};

const usePostSelector = (field, postId) => {
  return useAicThunkSelector(
    (state) => state.post && state.post[field],
    (state) => state.post,
    getPost,
    { postId }
  );
};

const PostTitle = () => {
  const postId = 123;
  const title = usePostSelector('title', postId);
  const author = usePostSelector('author', postId);

  if (title === undefined) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Post: {title}</h1>
      <strong>Author: {author}</strong>
    </div>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <PostTitle />
  </Provider>,
  document.body
);
```

[![Edit react-redux-aic-demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-redux-aic-demo-t3u5z?fontsize=14&hidenavigation=1&theme=dark)

## Dependencies

react, redux, react-redux

