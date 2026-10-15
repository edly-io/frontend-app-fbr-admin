import React from 'react';
import { Button, Card, Icon } from '@openedx/paragon';
import { Lock } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../../messages';
import './unauthorized-page-styles.scss';

/**
 * Full-viewport screen for signed-in users who lack any admin console role.
 * Deliberately does NOT render the admin shell (sidebar, mobile nav): we don't
 * want the structure to leak to users who shouldn't see any of it.
 */
const UnauthorizedPage = () => {
  const intl = useIntl();

  const handleSignInAsOther = () => {
    const lmsBaseUrl = getConfig().LMS_BASE_URL;
    const loginUrl = `${lmsBaseUrl}/login?next=${encodeURIComponent(window.location.href)}`;
    window.location.assign(`${lmsBaseUrl}/logout?redirect_url=${encodeURIComponent(loginUrl)}`);
  };

  return (
    <div className="fbr-admin-unauthorized-page">
      <Card className="fbr-admin-unauthorized-page__card">
        <Card.Section className="fbr-admin-unauthorized-page__card-section">
          <Icon
            src={Lock}
            className="fbr-admin-unauthorized-page__icon"
            screenReaderText=""
          />
          <h1 className="fbr-admin-unauthorized-page__title h4">
            {intl.formatMessage(messages.unauthorizedTitle)}
          </h1>
          <p className="fbr-admin-unauthorized-page__body">
            {intl.formatMessage(messages.unauthorizedBody)}
          </p>
          <Button
            variant="primary"
            onClick={handleSignInAsOther}
            className="fbr-admin-unauthorized-page__action"
          >
            {intl.formatMessage(messages.unauthorizedSignIn)}
          </Button>
        </Card.Section>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;
