import React, { Component, PropTypes } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import * as actions from 'actions/planet';

class PlanetDetailContainer extends Component {

  static propTypes = {
    name: PropTypes.string,
    planetId: PropTypes.string,
    fetchPlanet: PropTypes.func,
    isLoading: PropTypes.bool,
  };

  componentWillMount() {
    const { fetchPlanet, planetId } = this.props;
    fetchPlanet(planetId);
  }

  render() {
    const { name, isLoading } = this.props;
    if (isLoading) {
      return <div>Loading planet...</div>;
    }
    return <div>{name}</div>;
  }
}

export default withRouter(connect(
  (state) => ({ ...state.planet }),
  actions,
)(PlanetDetailContainer));
