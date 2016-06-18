import axios from 'axios';

export const FETCH_PLANET_ITEM_AWAIT = 'FETCH_PLANET_ITEM_AWAIT';
export const FETCH_PLANET_ITEM_SUCCESS = 'FETCH_PLANET_ITEM_SUCCESS';
export const FETCH_PLANET_ITEM_FAILED = 'FETCH_PLANET_ITEM_FAILED';

const loadingPlanet = ({
  type: FETCH_PLANET_ITEM_AWAIT,
});

const receivePlanet = (planet) => {
  // SWAPI is weird and doesn't provide planet Id.
  const match = planet.url.match(/(\d+)\/$/);
  planet.id = match[1]; // eslint-disable-line

  return {
    type: FETCH_PLANET_ITEM_SUCCESS,
    planet,
  };
};


export const fetchPlanet = (id) =>
  (dispatch, getState) => {
    const state = getState();
    if (state.planet && parseInt(id, 10) === parseInt(state.planet.id, 10)) {
      return;
    }
    dispatch(loadingPlanet);
    axios.get(`http://swapi.co/api/planets/${id}`)
    .then(response => {
      dispatch(receivePlanet(response.data));
    })
    .catch(() => dispatch({ type: FETCH_PLANET_ITEM_FAILED }));
  };
