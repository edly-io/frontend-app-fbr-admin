import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../../messages';
import './placeholder-page-styles.scss';

const PlaceholderPage = ({ title }) => {
  const intl = useIntl();

  return (
    <>
      <p className="placeholder-page__breadcrumb">
        <span>{intl.formatMessage(messages.breadcrumbAdministration)}</span>
        <span className="placeholder-page__breadcrumb-divider">/</span>
        <span className="placeholder-page__breadcrumb-leaf">{title}</span>
      </p>
      <h1 className="placeholder-page__title">{title}</h1>
      <div className="placeholder-page__card">
        <p className="placeholder-page__body">
          {intl.formatMessage(messages.placeholderBody)}
        </p>
      </div>
    </>
  );
};

PlaceholderPage.propTypes = { title: PropTypes.string.isRequired };

export default PlaceholderPage;
