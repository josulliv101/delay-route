'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRouter = require('react-router');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * 'Delay a Route' --actually,  this is hiding the visual display of a route before some condition
 * is met. It can be helpful if there's rendering that needs to take place but you don't want to
 * immediately show the route - async work may need to be fired off & resolved first.
 *
 * If using on the server, conditions which affect the delay prop should already be met
 * (any async work should already be completed and the 'delay' prop should be false).
 *
 */
var DelayRoute = function (_React$Component) {
  _inherits(DelayRoute, _React$Component);

  function DelayRoute(props, context) {
    _classCallCheck(this, DelayRoute);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props, context));

    var location = context.router.route.location;

    _this.state = {
      // Current location's pathname changed (example: from '/' to '/foo')
      transitioning: false,
      rawDelayPath: location && location.pathname,
      // The last location - this may or not be valid. Or it's possible that it starts out
      // invalid then based on new props coming in changes to valid.
      validDelayPath: location && location.pathname
    };
    return _this;
  }

  // A reference to the previous route that will be shown until the new route is ready for
  // display. Not all previous locations can be used in terms of good UI. In the async work
  // scenario, routes where the user clicks away before the async work is fully loaded 
  // should not be used -- and the App's global 'loading' state maps to the delay prop.


  DelayRoute.prototype.isValidateLocation = function isValidateLocation() {
    return !this.state.transitioning && !this.props.delay;
  };

  DelayRoute.prototype.validateDelayPath = function validateDelayPath() {
    var _state = this.state,
        rawDelayPath = _state.rawDelayPath,
        validDelayPath = _state.validDelayPath;
    // Already set and passed validation

    if (rawDelayPath === validDelayPath) return;
    if (this.isValidateLocation()) {
      this.setState({ validDelayPath: this.state.rawDelayPath });
    }
  };

  DelayRoute.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps, nextContext) {
    var location = this.context.router.route.location;
    var nextLocation = nextContext.router.route.location;
    var _state2 = this.state,
        rawDelayPath = _state2.rawDelayPath,
        validDelayPath = _state2.validDelayPath;

    if (nextLocation !== location) {
      this.setState({ transitioning: true, rawDelayPath: nextLocation.pathname });
      // The path just changed. Let the rest of the tree render. This gives a chance for the global
      // state to change (componentWillMount) which may alter the passed-in 'delay' prop.
      return;
    }
  };

  DelayRoute.prototype.componentDidMount = function componentDidMount() {
    var _state3 = this.state,
        rawDelayPath = _state3.rawDelayPath,
        validDelayPath = _state3.validDelayPath;

    this.validateDelayPath();
  };

  DelayRoute.prototype.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
    var _state4 = this.state,
        rawDelayPath = _state4.rawDelayPath,
        validDelayPath = _state4.validDelayPath;
    var validateLocation = this.props.validateLocation;
    // Transitioning done, so any sub-tree rendering is also done

    if (this.state.transitioning === true) {
      this.setState({ transitioning: false });
      // Don't try setting delayPath until one render is done
      return;
    }
    // Validate on every props change after route transition. Props could potentially change making
    // the location 'good' - for example when async works is loaded. Do it here instead of 
    // 'componentWillReceiveProps' so that routes with no delay can get added to validDelayPath.
    this.validateDelayPath();
  };

  DelayRoute.prototype.render = function render() {
    var _state5 = this.state,
        transitioning = _state5.transitioning,
        rawDelayPath = _state5.rawDelayPath,
        validDelayPath = _state5.validDelayPath;
    var delay = this.props.delay;
    // Both these paths will be visible by default. Up to developer to add css to hide one.

    if (transitioning || delay) return [_react2.default.createElement(_reactRouter.Route, _extends({ key: 'transitioningTo' }, this.props, { location: { pathname: validDelayPath || rawDelayPath } })), _react2.default.createElement(_reactRouter.Route, _extends({ key: 'main' }, this.props))];
    return _react2.default.createElement(_reactRouter.Route, _extends({ key: 'main' }, this.props));
  };

  return DelayRoute;
}(_react2.default.Component);

DelayRoute.propTypes = {
  delay: _propTypes2.default.bool,
  children: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.node])
};
DelayRoute.contextTypes = {
  router: _propTypes2.default.shape({
    history: _propTypes2.default.object.isRequired, // Needed?
    route: _propTypes2.default.object.isRequired, // Needed?
    staticContext: _propTypes2.default.object // Needed?
  })
};
DelayRoute.defaultProps = {
  // When true, the new route will not be visible, the current route stays displayed.
  delay: false
};
exports.default = DelayRoute;