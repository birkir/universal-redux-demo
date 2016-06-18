import React from 'react';
import ReactDOM from 'react-dom';
import { syncHistoryWithStore } from 'react-router-redux';
import { browserHistory, Router } from 'react-router';
import { Provider } from 'react-redux';
import configureStore from './store';
import configureRoutes from './routes';

// Fetch initial state
const initialState = JSON.parse(window.__INITIAL_STATE__); // eslint-disable-line
const store = configureStore(initialState);
const routes = configureRoutes(store);
const history = syncHistoryWithStore(browserHistory, store);


// Render the application
ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      {routes}
    </Router>
  </Provider>,
  document.getElementById('root')
);
