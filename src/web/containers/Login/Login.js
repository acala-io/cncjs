/* eslint-disable react/forbid-foreign-prop-types */

import classcat from 'classcat';
import React, {Fragment, PureComponent} from 'react';
import styled from 'styled-components';
import {withRouter, Redirect} from 'react-router-dom';

import controller from '../../lib/controller';
import i18n from '../../lib/i18n';
import log from '../../lib/log';
import user from '../../lib/user';
import {isEnter} from '../../lib/key-events';

import pkg from '../../../../package.json';
import store from '../../store_old';
import {defaultRouteLoggedIn} from '../../routes';

import Button from '../../components_new/Button';
import Icon from '../../components_new/Icon';
import Image from '../../components_new/Image';
import {Dialog, DialogActions, DialogFooter, DialogHeader} from '../../components_new/Dialog';
import {Link} from '../../components_new/Link';

import mixin from '../../styles/mixins/';
import s from '../../styles/variables';

const Logo = styled(Image)`
  ${mixin.centerMX} display: block;
`;

const AppName = styled.h2`
  color: ${s.color.primary.default};
  font-weight: ${s.font.weight.bold};
  text-align: center;
`;

const forgotPasswordLink = 'https://cnc.js.org/docs/faq/#forgot-your-password';

const ForgotPasswordLink = styled.a`
  ${mixin.link} display: block;
`;

const ErrorMessage = styled.div`
  color: ${s.color.state.error};
  margin-bottom: {s.sized.default};
  text-align: center;
`;

const UserCredentials = styled.div`
  background: ${s.color.background.white};
  border-radius: ${s.border.radius.default};
  margin: 0 ${s.size.default} ${s.size.default};
  position: relative;
`;

const UserCredentialsAction = styled(Link)`
  ${mixin.pinRight}

  font-size: ${s.font.size.default};
  padding: ${s.size.default};
  text-align: center;
  top: -${s.size.tiny};
  user-select: none;
  z-index: ${s.zIndex.overlayed1};

`;

class Login extends PureComponent {
  static propTypes = {
    ...withRouter.propTypes,
  };

  _ismounted = false;

  state = this.getDefaultState();

  getDefaultState() {
    return {
      errorMessage: '',
      isAuthenticating: false,
      name: '',
      password: '',
      passwordInputType: 'password',
      redirectToHomepage: false,
    };
  }

  render() {
    const {errorMessage, redirectToHomepage} = this.state;

    if (redirectToHomepage) {
      return <Redirect to={defaultRouteLoggedIn} />;
    }

    return (
      <Dialog className={classcat(['login', {'indicate-error': Boolean(errorMessage)}])} animated={false} noPad>
        <DialogHeader>
          <Logo src="images/logo-square-256x256.png" height={128} width={128} />
          <AppName>{pkg.name}</AppName>
        </DialogHeader>
        {this.errors}
        <UserCredentials className="user-credentials input-stack stacked--vertically">
          {this.usernameInput}
          {this.passwordInput}
        </UserCredentials>
        <DialogActions>{this.loginButton}</DialogActions>
        <DialogFooter noPad>
          <ForgotPasswordLink href={forgotPasswordLink}>{i18n._('Forgot password?')}</ForgotPasswordLink>
        </DialogFooter>
      </Dialog>
    );
  }

  get errors() {
    const {errorMessage} = {...this.state};

    if (!errorMessage) {
      return null;
    }

    return <ErrorMessage>{errorMessage}</ErrorMessage>;
  }

  get usernameInput() {
    return (
      <div className="input-stack__item input-add-on input--large">
        <span className="input-add-on__label">
          <Icon
            name="avatar"
            size="large"
            style={{
              left: `-${s.size.tiny}`,
              top: `-${s.size.small}`,
            }}
          />
        </span>
        <input
          ref={ref => (this.usernameNode = ref)}
          type="text"
          className="input-add-on__input"
          placeholder={i18n._('Username')}
          onKeyDown={this.checkInput}
          onChange={this.updateName}
        />
      </div>
    );
  }

  get passwordInput() {
    const {passwordInputType} = this.state;

    return (
      <Fragment>
        <div className="input-stack__item input-add-on input--large relative">
          <span className="input-add-on__label">
            <Icon
              name="password"
              size="large"
              style={{
                left: `-${s.size.tiny}`,
                top: `-${s.size.small}`,
              }}
            />
          </span>
          <input
            type={this.state.passwordInputType}
            className="input-add-on__input"
            placeholder={i18n._('Password')}
            onKeyDown={this.checkInput}
            onChange={this.updatePassword}
            autoComplete="off"
          />
          <UserCredentialsAction
            onClick={this.togglePasswordVisibility}
            title={passwordInputType === 'password' ? i18n._('Show') : i18n._('Hide')}
          >
            <Icon name={passwordInputType === 'password' ? 'visible' : 'invisible'} />
          </UserCredentialsAction>
        </div>
      </Fragment>
    );
  }

  get loginButton() {
    const {isAuthenticating} = this.state;

    return (
      <Button
        size="large"
        text={i18n._('Log In')}
        onClick={this.login}
        isDisabled={!this.isValid}
        isInProgress={isAuthenticating}
        fullWidth
      />
    );
  }

  get isValid() {
    // Hack for detecting whether chrome has autofilled both fields.
    // When the user interacts with the page, React's lifecycle takes over.
    if (window.document && document.querySelectorAll) {
      try {
        const nl = document.querySelectorAll('input:-webkit-autofill');
        if (nl.length === 2) {
          return true;
        }
      } catch (e) {
        // Do nothing
      }
    }

    const {name, password} = this.state;

    return name.length >= 2 && password.length >= 4;
  }

  checkInput = e => {
    if (isEnter(e) && this.isValid) {
      this.login();
    }
  };

  updateName = e => {
    this.setState({name: e.target.value.trim()}, this.clearErrors);
  };

  updatePassword = e => {
    this.setState({password: e.target.value.trim()}, this.clearErrors);
  };

  togglePasswordVisibility = () => {
    const {passwordInputType} = this.state;

    const toggle = {
      password: 'text',
      text: 'password',
    };

    this.setState({
      passwordInputType: toggle[passwordInputType],
    });
  };

  login = () => {
    const {errorMessage, isAuthenticating, redirectToHomepage} = this.getDefaultState();

    this.setState({
      errorMessage,
      isAuthenticating,
      redirectToHomepage,
    });

    const {name, password} = this.state;

    user
      .signin({
        name,
        password,
      })
      .then(({authenticated}) => {
        if (!authenticated) {
          // add CSS class that animates the dialog and remove it again after the animation has run
          this.setState({
            errorMessage: i18n._('Combination of username and password is not valid.'),
            isAuthenticating,
            redirectToHomepage,
          });

          setTimeout(this.clearErrors, 2000);

          return;
        }

        log.debug('Create and establish a WebSocket connection');

        const host = '';
        const token = store.get('session.token');
        const options = {
          query: `token=${token}`,
        };

        controller.connect(
          host,
          options,
          () => {
            // @see "src/web/index.js"
            this.setState({
              errorMessage,
              isAuthenticating,
              redirectToHomepage: true,
            });
          }
        );
      });
  };

  clearErrors = () => {
    this.setState({
      errorMessage: this.getDefaultState().errorMessage,
    });
  };

  componentDidMount() {
    this._ismounted = true;

    // enable the login button, if a password manager has filled in the
    // form after rendering the page
    setTimeout(() => {
      // make sure forceUpdate is not called, if the component was unmounted during the running timeout
      if (this._ismounted) {
        this.forceUpdate();
      }

      // autoFocus username input
      this.usernameNode.focus();
    }, 100);
  }

  componentWillUnmount() {
    this._ismounted = false;
  }
}

export default withRouter(Login);
