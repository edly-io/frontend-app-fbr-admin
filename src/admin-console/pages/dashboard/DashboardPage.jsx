import React, { useMemo } from 'react';
import { Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
import PermissionDeniedAlert from '../../components/PermissionDeniedAlert';
import AttendanceOverview from './AttendanceOverview';
import NeedsAttention from './NeedsAttention';
import ProgramPerformance from './ProgramPerformance';
import SessionsOverview from './SessionsOverview';
import UsersOverview from './UsersOverview';
import {
  useDashboardKpis, useDashboardNeedsAttention, useDashboardSessionDelivery,
  useDashboardUserComposition,
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
 * Admin dashboard. Each API-backed section owns its own query under
 * `/fbr/api/reports/dashboard/`, so one failing endpoint degrades on its own.
 * Attendance has no endpoint yet and still reads from `dashboardMockData`.
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

  const {
    data: needsAttention, isLoading: isAttentionLoading, isError: isAttentionError,
  } = useDashboardNeedsAttention({ enabled: isAccessReady });

  const mockMetrics = useMemo(() => getDashboardMetrics(dashboardMockData), []);
  const { programs, attendanceMetrics } = mockMetrics;

  // Dates the figures on screen, not the moment the page was opened.
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
        needsAttention={needsAttention}
        isLoading={isAttentionLoading}
        isError={isAttentionError}
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

      <AttendanceOverview
        attendanceMetrics={attendanceMetrics}
        programs={programs}
      />
    </div>
  );
};

export default DashboardPage;
