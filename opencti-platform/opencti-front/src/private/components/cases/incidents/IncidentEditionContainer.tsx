import React, { FunctionComponent } from 'react';
import { graphql, PreloadedQuery, usePreloadedQuery } from 'react-relay';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Close } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import { SubscriptionAvatars } from '../../../../components/Subscription';
import { Theme } from '../../../../components/Theme';
import { useFormatter } from '../../../../components/i18n';
import ErrorNotFound from '../../../../components/ErrorNotFound';
import CaseEditionOverview from './IncidentEditionOverview';
import { IncidentEditionContainerCaseQuery } from './__generated__/IncidentEditionContainerCaseQuery.graphql';
import { useIsEnforceReference } from '../../../../utils/hooks/useEntitySettings';

const useStyles = makeStyles<Theme>((theme) => ({
  header: {
    backgroundColor: theme.palette.background.nav,
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
    color: 'inherit',
  },
  importButton: {
    position: 'absolute',
    top: 15,
    right: 20,
  },
  container: {
    padding: '10px 20px 20px 20px',
  },
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
    borderBottom: '1px solid #5c5c5c',
  },
  title: {
    float: 'left',
  },
}));

interface CaseEditionContainerProps {
  queryRef: PreloadedQuery<IncidentEditionContainerCaseQuery>;
  handleClose: () => void;
}

export const incidentEditionQuery = graphql`
  query IncidentEditionContainerCaseQuery($id: String!) {
    case(id: $id) {
      ...IncidentEditionOverview_case
      editContext {
        name
        focusOn
      }
    }
  }
`;

const IncidentEditionContainer: FunctionComponent<
CaseEditionContainerProps
> = ({ queryRef, handleClose }) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const queryData = usePreloadedQuery(incidentEditionQuery, queryRef);
  if (queryData.case === null) {
    return <ErrorNotFound />;
  }
  return (
    <div>
      <div className={classes.header}>
        <IconButton
          aria-label="Close"
          className={classes.closeButton}
          onClick={handleClose}
          size="large"
          color="primary"
        >
          <Close fontSize="small" color="primary" />
        </IconButton>
        <Typography variant="h6" classes={{ root: classes.title }}>
          {t('Update a incident')}
        </Typography>
        <SubscriptionAvatars context={queryData.case.editContext} />
        <div className="clearfix" />
      </div>
      <div className={classes.container}>
        <CaseEditionOverview
          caseRef={queryData.case}
          context={queryData.case.editContext}
          enableReferences={useIsEnforceReference('Case')}
          handleClose={handleClose}
        />
      </div>
    </div>
  );
};

export default IncidentEditionContainer;
