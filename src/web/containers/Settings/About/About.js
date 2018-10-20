import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import styled from 'styled-components';

import i18n from '../../../lib/i18n';

import pkg from '../../../../../package.json';

import Button from '../../../components_new/Button';
import UpdateStatus from './UpdateStatus';

import s from '../../../styles/variables';
import mixin from '../../../styles/mixins/';

const openUrl = url => window.open(url, '_blank');

const releaseURL = `${pkg.homepage}/releases`;
const issuesURL = pkg.issues;
const documentationURL = `${pkg.homepage}/wiki`;

const onReadDocumentation = () => openUrl(documentationURL);
const onViewReleases = () => openUrl(releaseURL);
const onReportIssue = () => openUrl(issuesURL);

const Logo = styled.img`
  ${mixin.centerMX} display: block;
  height: auto;
  padding-top: ${s.globalSpacingUnit.large};
  width: 256px;
`;

const ProductName = styled.p`
  font-size: ${s.font.size.huge};
  font-weight: bold;
  margin-bottom: 0;
`;

const ProductVersion = styled.p`
  color: ${s.color.text.lighter};
  padding-bottom: ${s.globalSpacingUnit.large};
`;

const ProductDescription = styled.p`
  color: ${s.color.text.lighter};
  padding-bottom: ${s.globalSpacingUnit.default};
`;

const AboutContainer = styled.div`
  padding-bottom: ${s.globalSpacingUnit.large};
  text-align: center;
`;

class About extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  render() {
    const {version} = this.props.state;

    return (
      <AboutContainer>
        <Logo src="images/logo-square-256x256.png" />
        <div>
          <ProductName>{pkg.name}</ProductName>
          <ProductVersion>
            {pkg.version} <UpdateStatus {...version} />
          </ProductVersion>
          <ProductDescription>{i18n._(pkg.description)}</ProductDescription>
          <Button text={i18n._('Read Documentation')} onClick={onReadDocumentation} className="u-margin-right" />
          <Button text={i18n._('View Downloads')} onClick={onViewReleases} className="u-margin-right" />
          <Button text={i18n._('Report an issue')} onClick={onReportIssue} />
        </div>
      </AboutContainer>
    );
  }

  componentDidMount() {
    this.props.actions.checkLatestVersion();
  }
}

export default About;
