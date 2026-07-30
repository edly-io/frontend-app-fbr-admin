import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PlaceholderPage from '../components/PlaceholderPage';
import messages from '../messages';

const AccessPoliciesPage = () => {
  const intl = useIntl();
  return <PlaceholderPage title={intl.formatMessage(messages.navAccessPolicies)} />;
};

export default AccessPoliciesPage;
