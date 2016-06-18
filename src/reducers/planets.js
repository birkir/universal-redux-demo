import {
  FETCH_PLANETS_AWAIT,
  FETCH_PLANETS_SUCCESS,
} from 'actions/planets';

export default (state = {
  items: [],
  isLoading: false,
  shouldFetch: true,
}, action) => {

  const {
    type,
    planets,
  } = action;

  switch (type) {
    case FETCH_PLANETS_AWAIT:
      return {
        ...state,
        isLoading: true,
      };

    case FETCH_PLANETS_SUCCESS:
      return {
        ...state,
        items: planets,
        isLoading: false,
        shouldFetch: false,
      };

    default:
      return state;
  }
};
