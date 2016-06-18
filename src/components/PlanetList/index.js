import React, { Component, PropTypes } from 'react';
import s from './styles.less';

/**
 * Container component
 */
export default class PlanetList extends Component {

  static propTypes = {
    children: PropTypes.node,
  };

  /**
   * Render method
   * @return {Component}
   */
  render() {
    return (
      <div className={s.container}>
        {this.props.children}
      </div>
    );
  }
}
