/* eslint-disable */
import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from 'containers/App';
import Home from 'routes/Home';
import Planet from 'routes/Planet';

export default (store) => (
  <Route path="/" component={App}>
    <IndexRoute component={Home} />
    <Route path="planet/:id" component={Planet} />
  </Route>
);
