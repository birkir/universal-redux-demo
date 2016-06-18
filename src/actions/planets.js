import axios from 'axios';

export const FETCH_PLANETS_AWAIT = 'FETCH_PLANETS_AWAIT';
export const FETCH_PLANETS_SUCCESS = 'FETCH_PLANETS_SUCCESS';
export const FETCH_PLANETS_FAILED = 'FETCH_PLANETS_FAILED';

const loadingPlanets = ({
  type: FETCH_PLANETS_AWAIT,
});

const receivePlanets = (data) => ({
  type: FETCH_PLANETS_SUCCESS,
  planets: data.results,
});

export const fetchPlanets = () =>
  (dispatch) => {
    dispatch(loadingPlanets);
    axios.get('http://swapi.co/api/planets')
    .then(response => {
      dispatch(receivePlanets(response.data));
    })
    .catch(() => dispatch({ type: FETCH_PLANETS_FAILED }));
  };
