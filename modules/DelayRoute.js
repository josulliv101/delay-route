import warning from 'warning'
import invariant from 'invariant';
import React from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router'

/**
 * 'Delay a Route' --actually,  this is hiding the visual display of a route before some condition
 * is met. It can be helpful if there's rendering that needs to take place but you don't want to
 * immediately show the route - async work may need to be fired off & resolved first.
 *
 * If using on the server, conditions which affect the delay prop should already be met
 * (any async work should already be completed and the 'delay' prop should be false).
 *
 */
class DelayRoute extends React.Component {

  static propTypes = {
    delay: PropTypes.bool,
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.node
    ]),
  };

  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.object.isRequired, // Needed?
      route: PropTypes.object.isRequired, // Needed?
      staticContext: PropTypes.object // Needed?
    })
  };

  static defaultProps = {
    // When true, the new route will not be visible, the current route stays displayed.
    delay: false,
  };

  constructor(props, context) {
    super(props, context);
    const { location } = context.router.route
    this.state = {
      // Current location's pathname changed (example: from '/' to '/foo')
      transitioning: false,
      rawDelayPath: location && location.pathname,
      // The last location - this may or not be valid. Or it's possible that it starts out
      // invalid then based on new props coming in changes to valid.
      validDelayPath: location && location.pathname,
    }
  }

  // A reference to the previous route that will be shown until the new route is ready for
  // display. Not all previous locations can be used in terms of good UI. In the async work
  // scenario, routes where the user clicks away before the async work is fully loaded 
  // should not be used -- and the App's global 'loading' state maps to the delay prop.
  isValidateLocation() {
    return !this.state.transitioning && !this.props.delay
  }

  validateDelayPath() {
    const { rawDelayPath, validDelayPath } = this.state
    // Already set and passed validation
    if (rawDelayPath === validDelayPath) return
    if (this.isValidateLocation()) {
      this.setState({ validDelayPath: this.state.rawDelayPath })
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { location } = this.context.router.route
    const { location: nextLocation } = nextContext.router.route
    const { rawDelayPath, validDelayPath } = this.state
    if (nextLocation !== location) {
      this.setState({ transitioning: true, rawDelayPath: nextLocation.pathname })
      // The path just changed. Let the rest of the tree render. This gives a chance for the global
      // state to change (componentWillMount) which may alter the passed-in 'delay' prop.
      return
    }
  }
  
  componentDidMount() {
    const { rawDelayPath, validDelayPath } = this.state
    this.validateDelayPath()
  }

  componentDidUpdate(prevProps, prevState) {
    const { rawDelayPath, validDelayPath } = this.state
    const { validateLocation } = this.props
    // Transitioning done, so any sub-tree rendering is also done
    if (this.state.transitioning === true) {
      this.setState({ transitioning: false })
      // Don't try setting delayPath until one render is done
      return
    } 
    // Validate on every props change after route transition. Props could potentially change making
    // the location 'good' - for example when async works is loaded. Do it here instead of 
    // 'componentWillReceiveProps' so that routes with no delay can get added to validDelayPath.
    this.validateDelayPath()
  }
  
  render() {
    const { transitioning, rawDelayPath, validDelayPath } = this.state
    const { delay } = this.props
    // Both these paths will be visible by default. Up to developer to add css to hide one.
    if (transitioning || delay) return [
      <Route key="transitioningTo" {...this.props} location={{ pathname: validDelayPath || rawDelayPath }} />,
      <Route key="main" {...this.props} />
    ]
    return <Route key="main" {...this.props} />
  }
}

export default DelayRoute