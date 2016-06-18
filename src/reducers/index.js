import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import planets from './planets';
import planet from './planet';

function lastAction(state = null, action) {
  return {
    type: action.type,
  };
}

export default combineReducers({
  planets,
  planet,
  lastAction,
  routing: routerReducer,
});
