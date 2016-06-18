import {
  FETCH_PLANET_ITEM_AWAIT,
  FETCH_PLANET_ITEM_SUCCESS,
} from 'actions/planet';

export default (state = {}, action) => {

  const {
    type,
    planet,
  } = action;

  switch (type) {

    case FETCH_PLANET_ITEM_AWAIT:
      return {
        ...state,
        isLoading: true,
      };

    case FETCH_PLANET_ITEM_SUCCESS:
      return {
        ...state,
        ...planet,
        isLoading: false,
      };

    default:
      return state;
  }
};
