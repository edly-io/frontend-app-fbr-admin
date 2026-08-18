import React, { useMemo } from 'react';
import { Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
import PermissionDeniedAlert from '../../components/PermissionDeniedAlert';
import AttendanceOverview from './AttendanceOverview';
import FeedbackOverview from './FeedbackOverview';
import NeedsAttention from './NeedsAttention';
import ProgramPerformance from './ProgramPerformance';
import SessionsOverview from './SessionsOverview';
import UsersOverview from './UsersOverview';
import {
  useDashboardKpis, useDashboardSessionDelivery, useDashboardUserComposition,
} from './data/apiHooks';
import { dashboardMockData } from './data/mockData';
import { getDashboardMetrics } from './data/selectors';
import { useReportsAccess } from '../../data/apiHooks';
import messages from './messages';
import './styles.scss';

const AS_OF_FORMAT = {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
};

/**
 * Admin dashboard.
 *
 * Program performance, Users and Sessions are each backed by their own endpoint
 * under `/fbr/api/reports/dashboard/`, fetched independently so a section that
 * fails degrades on its own. Access is Data Admin or higher, matching the
 * backend's own gate, so the page is gated on the same capability the report
 * pages use rather than waiting for a 403.
 *
 * Attendance, Feedback and the results/certificate signals in Needs attention
 * have no endpoint yet and still read from `dashboardMockData`; they swap over
 * the same way once those endpoints land.
 */
const DashboardPage = () => {
  const intl = useIntl();

  const { capabilities, isLoading: isAccessLoading } = useReportsAccess();
  const isAccessReady = !isAccessLoading && capabilities.canAccessPrograms;

  const {
    data: kpis, isLoading: isKpisLoading, isError: isKpisError, dataUpdatedAt,
  } = useDashboardKpis({ enabled: isAccessReady });

  const {
    data: users, isLoading: isUsersLoading, isError: isUsersError,
  } = useDashboardUserComposition({ enabled: isAccessReady });

  const {
    data: sessions, isLoading: isSessionsLoading, isError: isSessionsError,
  } = useDashboardSessionDelivery({ enabled: isAccessReady });

  // Attendance, Feedback and the programme-level signals behind Needs attention
  // are still mock-backed - see the component docblock above.
  const mockMetrics = useMemo(() => getDashboardMetrics(dashboardMockData), []);
  const { programMetrics, attendanceMetrics, feedbackMetrics } = mockMetrics;

  // Stamped from the KPI response rather than render time, so the caption dates
  // the figures on screen and not the moment the page was opened.
  const generatedAt = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  if (isAccessLoading) {
    return (
      <div className="dashboard-page d-flex justify-content-center py-5">
        <Spinner animation="border" screenReaderText={intl.formatMessage(messages.pageTitle)} />
      </div>
    );
  }

  if (!capabilities.canAccessPrograms) {
    return (
      <div className="dashboard-page">
        <Breadcrumb leaf={intl.formatMessage(messages.breadcrumbLeaf)} />
        <PermissionDeniedAlert />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Breadcrumb leaf={intl.formatMessage(messages.breadcrumbLeaf)} />

      <h1 className="h3 fw-bold mb-1">{intl.formatMessage(messages.pageTitle)}</h1>
      <p className="dashboard-page__subtitle small mb-1">
        {intl.formatMessage(messages.pageSubtitle)}
      </p>
      {generatedAt && (
        <p className="dashboard-page__as-of mb-4">
          {intl.formatMessage(messages.asOf, {
            timestamp: intl.formatDate(generatedAt, AS_OF_FORMAT),
          })}
        </p>
      )}

      <NeedsAttention
        programMetrics={programMetrics}
        attendanceMetrics={attendanceMetrics}
        pendingApprovals={users?.pendingApproval || 0}
      />

      <ProgramPerformance
        kpis={kpis}
        isLoading={isKpisLoading}
        isError={isKpisError}
      />

      <UsersOverview
        users={users}
        isLoading={isUsersLoading}
        isError={isUsersError}
      />

      <SessionsOverview
        sessions={sessions}
        isLoading={isSessionsLoading}
        isError={isSessionsError}
      />

      <div className="row dashboard-page__split">
        <div className="col-12 col-xl-7 dashboard-page__split-col">
          <AttendanceOverview
            attendanceMetrics={attendanceMetrics}
            programs={programMetrics.programs}
          />
        </div>
        <div className="col-12 col-xl-5 dashboard-page__split-col">
          <FeedbackOverview feedbackMetrics={feedbackMetrics} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
