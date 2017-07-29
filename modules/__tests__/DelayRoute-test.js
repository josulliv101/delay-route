import raf from 'raf/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import createMemoryHistory from 'history/createMemoryHistory'
import { MemoryRouter, Router, Route } from 'react-router'
import DelayRoute from '../DelayRoute'

const App = (props) => <div>{props.children}</div>

describe('A <DelayRoute>', () => {

  it('renders a child element', () => {
    const TEXT = 'Foo Bar'
    const node = document.createElement('div')
    ReactDOM.render((
      <MemoryRouter initialEntries={[ '/' ]}>
        <DelayRoute path="/">
          <div>{TEXT}</div>
        </DelayRoute>
      </MemoryRouter>
    ), node)

    expect(node.innerHTML).toContain(TEXT)
  })

 describe('when a route changes and there\'s a delay', () => {

    it('renders the new route (hidden) and the old route (visible)', () => {
      const node = document.createElement('div')

      let push
      ReactDOM.render((
        <MemoryRouter initialEntries={[ '/widgets/foo' ]}>
          <App>
            <DelayRoute delay={true} path="/widgets/:type" render={({ history, location, staticContext, match, ...props }) => {
              push = history.push
              return <span>{match.url}</span>
            }}/>            
          </App>
        </MemoryRouter>
      ), node)
      push('/widgets/bar')
      expect(node.innerHTML).toContain('<span>/widgets/foo</span>')
      expect(node.innerHTML).toContain('<span>/widgets/bar</span>')
    })

  });

  describe('when a route changes and there\'s no delay', () => {

   it('renders the new route (visible) only', () => {
      const node = document.createElement('div')

      let push
      ReactDOM.render((
        <MemoryRouter initialEntries={[ '/widgets/foo' ]}>
          <App>
            <DelayRoute path="/widgets/:type" render={({ history, location, staticContext, match, ...props }) => {
              push = history.push
              return <span>{match.url}</span>
            }}/>            
          </App>
        </MemoryRouter>
      ), node)
      push('/widgets/bar')
      expect(node.innerHTML).toContain('<span>/widgets/bar</span>')
    })

  });

});

describe('Integration Tests', () => {

  it('renders nested matches normally', () => {
    const node = document.createElement('div')
    const TEXT1 = 'Foo'
    const TEXT2 = 'Bar'

    let push
    ReactDOM.render((
      <MemoryRouter initialEntries={[ '/' ]}>
        <App>
          <DelayRoute path="/" render={({ history, location, staticContext, match, ...props }) => {
            push = history.push
            return (
              <div {...props}>
                <h1>{TEXT1}</h1>
                <Route path="/nested" render={() => (
                  <h2>{TEXT2}</h2>
                )}/>
              </div>
            )}
          }/>
        </App>
      </MemoryRouter>
    ), node)
    push('/nested')
    console.log(node.innerHTML)
    expect(node.innerHTML).toContain(TEXT1)
    expect(node.innerHTML).toContain(TEXT2)
  })

  it('renders nested matches while delay is true', () => {
    const node = document.createElement('div')
    const TEXT1 = 'Foo'
    const TEXT2 = 'Bar'

    let push
    ReactDOM.render((
      <MemoryRouter initialEntries={[ '/' ]}>
        <App>
          <DelayRoute delay={true} path="/" render={({ history, location, staticContext, match, ...props }) => {
            push = history.push
            return (
              <div {...props}>
                <h1>{TEXT1}</h1>
                <Route path="/nested" render={() => (
                  <h2>{TEXT2}</h2>
                )}/>
              </div>
            )}
          }/>
        </App>
      </MemoryRouter>
    ), node)
    push('/nested')
    console.log(node.innerHTML)
    expect(node.innerHTML).toContain('<div><div><h1>Foo</h1></div><div><h1>Foo</h1><h2>Bar</h2></div></div>')
  })

/**/
});
