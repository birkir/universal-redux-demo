import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import PlanetDetail from 'containers/PlanetDetail';

/**
 * Planet route component
 */
export default class Planet extends Component {

  static propTypes = {
    params: PropTypes.object,
  };

  /**
   * Render method
   * @return {Component}
   */
  render() {
    const { params } = this.props;
    const { id } = params;

    return (
      <div>
        <h1>Planet Detail</h1>
        <PlanetDetail planetId={id} />
        <Link to="/">Go back</Link>
      </div>
    );
  }
}
