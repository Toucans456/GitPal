/*
  grabs all the reducer from store/reducers.js and creates a store with it. A store manages state.
 */
import * as storage from 'redux-storage';
import {createStore, applyMiddleware, combineReducers} from 'redux';
import * as reducers from '/.reducers';

const reducer = storage.reducer(combineReducers(reducers));

import createEngine from 'redux-storage-engine-localstorage';
const engine = createEngine('my-save-key');

const middleware = storage.createMiddleware(engine);

const createStoreWithMiddleware = applyMiddleware(middleware)(createStore);
const store = createStoreWithMiddleware(
  reducers, /* preloadedState, */
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const load = storage.createLoader(engine);
load(store)
  .then((newState) => console.log('Loaded state:', newState))
  .catch(() => console.log('Failed to load previous state'));

export default store;
