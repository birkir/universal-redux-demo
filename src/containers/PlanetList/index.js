import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import * as actions from 'actions/planets';
import PlanetList from 'components/PlanetList';

class PlanetListContainer extends Component {

  static propTypes = {
    fetchPlanets: PropTypes.func,
    planets: PropTypes.any,
  };

  componentWillMount() {
    const { fetchPlanets, planets } = this.props;
    const { shouldFetch } = planets;

    if (shouldFetch) {
      // Fetch planets if server wasn't able to...
      fetchPlanets();
    }
  }

  render() {
    const { items, isLoading } = this.props.planets;

    if (isLoading) {
      return <h3>Loading planets...</h3>;
    }

    return (
      <PlanetList>
        {[].concat(items).map(item => {
          const match = item.url.match(/(\d+)\/$/);
          const id = match[1];
          return (
            <Link to={`/planet/${id}`} key={id} style={{ display: 'block' }}>
              {item.name}
            </Link>
          );
        })}
      </PlanetList>
    );
  }
}

export default connect(
  (state) => ({ planets: state.planets }),
  actions,
)(PlanetListContainer);
