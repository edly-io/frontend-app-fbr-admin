import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PlaceholderPage from '../../components/placeholder-page/PlaceholderPage';
import messages from '../../messages';

const CoursesPage = () => {
  const intl = useIntl();
  return <PlaceholderPage title={intl.formatMessage(messages.navCourses)} />;
};

export default CoursesPage;
