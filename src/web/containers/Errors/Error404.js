import React, {Fragment, PureComponent} from 'react';
// import {connect} from 'react-redux';
import {bool, func} from 'prop-types';
// import {Link} from 'redux-json-router';

// import {showModal} from './actions/dialogs';

// import BlankLayout from './layouts/Blank';
// import Login from './access/Login';
// import {Cell, Row} from './components/Grid';

class Error404 extends PureComponent {
  static propTypes = {
    // isLoggedIn: bool,
    // onShowLogin: func,
  };

  render() {
    // const {isLoggedIn, onShowLogin} = this.props;

    return (
      <Fragment>
        {/* <BlankLayout> */}
        <section className="center--xy error-page--404">
          {/* <Row>
            <Cell> */}
          <h1>404</h1>
          <p>
            Page not found
            {/* T('pageNotFound', '404') */}
          </p>
          {/* isLoggedIn ? null : (
                <p>
                  {T('loginToViewPages', '404')}{' '}
                  <span className="link u-padding-horizontal-tiny" onMouseDown={onShowLogin}>
                    {T('loginNow', '404')}
                  </span>
                </p>
              ) */}
          {/* <Link to="/">{T('goToHomePage', '404')}</Link> */}
          {/* </Cell>
          </Row> */}
        </section>
        {/* </BlankLayout> */}
      </Fragment>
    );
  }
}

// const mapDispatchToProps = dispatch => {
//   return {
//     onShowLogin: () => {
//       dispatch(showModal(Login));
//     },
//   };
// };

// const mapStateToProps = state => {
//   const {isLoggedIn} = state.access;

//   return {
//     isLoggedIn,
//   };
// };

// Error404 = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(Error404);

export default Error404;
