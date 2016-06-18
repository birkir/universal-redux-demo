/* eslint no-console: 0 */
import http from 'http';
import express from 'express';
import compression from 'compression';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Router, RouterContext, match } from 'react-router';
import { Provider } from 'react-redux';
import configureStore from './store';
import configureRoutes from './routes';
import _once from 'lodash/once';
import _debounce from 'lodash/debounce';

const release = (process.env.NODE_ENV === 'production');
const port = (parseInt(process.env.PORT, 10) || 3000) - !release;
const app = express();

// Set view engine
app.set('views', './src/server/views');
app.set('view engine', 'ejs');
app.use(compression());
app.use(express.static('./public'));
app.use(express.static('./build'));

// Route handler that rules them all!
app.get('*', (req, res) => {

  const store = configureStore();
  const routes = configureRoutes(store);
  const queue = new Set();

  // Do a router match
  match({
    routes: (<Router>{routes}</Router>),
    location: req.url,
  },
  (err, redirect, props) => {

    // Sanity checks
    if (err) {
      return res.status(500).send(err.message);
    } else if (redirect) {
      return res.redirect(302, redirect.pathname + redirect.search);
    } else if (!props) {
      return res.status(404).send('not found');
    }

    const root = (
      <Provider store={store}>
        <RouterContext {...props} />
      </Provider>
    );

    // Render (only once).
    const render = _once(() => res.render('index', {
      includeStyles: release,
      includeClient: true,
      initialState: store.getState(),
      renderedRoot: ReactDOMServer.renderToString(root),
    }));

    // Waits 100ms for next event to occour, but for maximum of 1250ms.
    const debouncedRender = _debounce(render, 100, { maxWait: 1250 });

    // Render after 100ms if no actions are dispatched
    const initialRender = setTimeout(render, 100);

    // Subscribe to the redux store
    store.subscribe(() => {
      clearTimeout(initialRender);

      // Fetch last action from state
      const { lastAction } = store.getState();
      const type = lastAction && lastAction.type;
      if (!type) return;

      const key = type.replace(/_(AWAIT|SUCCESS|FAILED)/, '');

      if (type.match(/_AWAIT$/)) {
        // Add to the queue if key ends with _AWAIT.
        queue.add(key);
      } else if (queue.has(key)) {
        // Remove from the queue if await was success or failed.
        queue.delete(key);
      }

      if (queue.size === 0) {
        // Queue is cleared, let's render
        debouncedRender();
      }
    });

    // First render to kickstart things
    ReactDOMServer.renderToString(root);
  });
});

// Create HTTP Server
const server = http.createServer(app);

// Start
server.listen(port, err => {
  if (err) throw err;
  console.info(`[🚀 ] Server started on port ${port}`);
});
