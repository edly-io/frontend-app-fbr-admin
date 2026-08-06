import React from 'react';
import { Alert } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../messages';

const PermissionDeniedAlert = () => {
  const intl = useIntl();

  return (
    <Alert variant="danger" data-testid="permissionDeniedAlert">
      {intl.formatMessage(messages.permissionDenied)}
    </Alert>
  );
};

export default PermissionDeniedAlert;
