import React from 'react';
import PropTypes from 'prop-types';
import { Alert, IconButton, Spinner } from '@openedx/paragon';
import { Visibility } from '@openedx/paragon/icons';
import { UserIdentity } from '@edly-io/frontend-component-fbr';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useProgramOverview } from './data/apiHooks';
import messages from './messages';

/**
 * Expanded content for a Program Report row - the program's trainee roster,
 * rendered inside the same table via `DataTable`'s `renderRowSubComponent`.
 * A left accent ties it back to the program row it belongs to. Trainees get
 * a view action opening `TraineeProgressSheet`.
 */
const ProgramOverviewPanel = ({ programKey, onViewTrainee }) => {
  const intl = useIntl();
  const { data, isLoading, isError } = useProgramOverview(programKey);

  if (isLoading) {
    return (
      <div className="program-overview-panel d-flex justify-content-center py-2">
        <Spinner animation="border" size="sm" screenReaderText={intl.formatMessage(messages.overviewLoading)} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="program-overview-panel py-2 px-3">
        <Alert variant="danger" className="mb-0 py-2">{intl.formatMessage(messages.overviewLoadError)}</Alert>
      </div>
    );
  }

  const trainees = data?.trainees || [];

  return (
    <div className="program-overview-panel py-2 px-3">
      <div className="program-overview-panel__section">
        <p className="small fw-bold text-uppercase text-muted mb-1">
          {intl.formatMessage(messages.overviewTraineesHeading, { count: trainees.length })}
        </p>
        {trainees.length === 0 ? (
          <p className="small text-muted mb-0">{intl.formatMessage(messages.overviewTraineesEmpty)}</p>
        ) : (
          // Capped height + scroll, rather than an unbounded list, so a
          // roster of even a few hundred trainees can't blow up the row's
          // (and therefore the whole table's) height.
          <ul className="program-overview-panel__trainee-list list-unstyled mb-0">
            {trainees.map((trainee, index) => (
              <li
                key={trainee.id}
                className={`program-overview-panel__trainee-row py-1${index < trainees.length - 1 ? ' border-bottom' : ''}`}
              >
                <UserIdentity name={trainee.name} badges={['Trainee']} size="compact" showAvatar enableHoverCard={false} />
                <span className="program-overview-panel__trainee-meta small text-muted text-truncate">
                  {trainee.email}
                  {trainee.batch ? ` · ${trainee.batch}` : ''}
                </span>
                <IconButton
                  src={Visibility}
                  size="inline"
                  alt={intl.formatMessage(messages.viewTraineeProgressAria, { trainee: trainee.name })}
                  onClick={() => onViewTrainee(trainee)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

ProgramOverviewPanel.propTypes = {
  programKey: PropTypes.string.isRequired,
  onViewTrainee: PropTypes.func.isRequired,
};

export default ProgramOverviewPanel;
