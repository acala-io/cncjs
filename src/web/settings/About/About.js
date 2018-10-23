import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import styled from 'styled-components';

import i18n from '../../lib/i18n';

import pkg from '../../../../package.json';

import Button from '../../components_new/Button';
import Section from '../../components_new/Section';
import UpdateStatus from './UpdateStatus';

import mixin from '../../styles/mixins/';

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
  padding-top: ${({theme}) => theme.size.large};
  width: 128px;
`;

const ProductName = styled.p`
  font-size: ${({theme}) => theme.font.size.huge};
  font-weight: ${({theme}) => theme.font.weight.bold};
  margin-bottom: 0;
`;

const LightParagraph = styled.p`
  color: ${({theme}) => theme.color.text.lighter};
  margin-bottom: 0;
`;

const ProductVersion = LightParagraph;

const ProductDescription = LightParagraph;

const StyledAbout = styled.div`
  text-align: center;
  width: 100%;
`;

class About extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  render() {
    const {version} = this.props.state;

    return (
      <StyledAbout>
        <Logo src="images/logo-square-256x256.png" />
        <Section>
          <ProductVersion>
            <ProductName>{pkg.name}</ProductName>
            {pkg.version} <UpdateStatus {...version} />
          </ProductVersion>
        </Section>
        <Section>
          <ProductDescription>{i18n._(pkg.description)}</ProductDescription>
        </Section>
        <Section>
          <Button text={i18n._('Read Documentation')} onClick={onReadDocumentation} />
          <Button text={i18n._('View Downloads')} onClick={onViewReleases} className="u-margin-horizontal" />
          <Button text={i18n._('Report an Issue')} onClick={onReportIssue} />
        </Section>
      </StyledAbout>
    );
  }

  componentDidMount() {
    this.props.actions.checkLatestVersion();
  }
}

export default About;
