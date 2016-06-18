import React, { Component } from 'react';
import PlanetList from 'containers/PlanetList';

/**
 * Home route component
 */
export default class Home extends Component {

  /**
   * Render method
   * @return {Component}
   */
  render() {
    return (
      <div>
        <h1>List of planets</h1>
        <PlanetList />
      </div>
    );
  }
}
