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
    validateLocation: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.node
    ]),
    location: PropTypes.object // Needed?
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

    // A reference to the previous route that will be shown until the new route is ready for
    // display. Not all previous locations can be used in terms of good UI. In the async work
    // scenario, routes where the user clicks away before the async work is fully loaded 
    // should not be used -- and the App's global 'loading' state maps to the delay prop.
    validateLocation: (props, state) => !state.transitioning && !props.delay,
  };

  constructor(props, context) {
    super(props, context);
    
    this.state = {

      // Current location's pathname changed (example: from '/' to '/foo')
      transitioning: false,

      // The last location - this may or not be valid. Or it's possible that it starts out
      // invalid then based on new props coming in changes to valid.
      prevLocation: context.router.route.location,

      // The last valid
      validPrevLocation: null,
    }
  }

  componentWillMount() {

  }

  componentWillReceiveProps(nextProps, nextContext) {

    const { location } = this.context.router.route
    const { location: nextLocation } = nextContext.router.route
    const { validateLocation } = this.props
    const { prevLocation } = this.state

    console.log('componentWillReceiveProps', location.pathname, nextLocation.pathname)

    if (nextLocation !== location) {
      this.setState({ transitioning: true, prevLocation: location })

      // The path just changed. Let the rest of the tree render. This gives a chance for the global
      // state to change (componentWillMount) which may alter the passed-in 'delay' prop.
      return

    }
    
    // Validate on every props change after route transition. Props could potentially change making
    // the location 'good' - for example when async works is loaded.
    if (validateLocation(prevLocation) === true) {
      this.setState({ validPrevLocation: prevLocation })
    }
  }

  componentDidUpdate(prevProps, prevState) {

    console.log('componentDidUpdate', this.state.transitioning)

    // Transitioning done, so any sub-tree rendering is also done
    if (this.state.transitioning) {
      this.setState({ transitioning: false })
    }
  }

  render() {

    const { transitioning, prevLocation, validPrevLocation } = this.state
    const { delay } = this.props

    console.log('render transitioning %s, delay %s', transitioning, delay)

    if (transitioning || delay) return [
      <Route {...this.props} render={ withStyleDisplayNone(this.props.render) } />,
      <Route {...this.props} location={ validPrevLocation || prevLocation } />
    ]

    return <Route {...this.props} />
  }
}

function withStyleDisplayNone(WrappedComponent) {
  const style = { display: 'none' }
  return function EnhancedComponent(props) {
    return <WrappedComponent {...props} style={style} />
  }
}

export default DelayRoute