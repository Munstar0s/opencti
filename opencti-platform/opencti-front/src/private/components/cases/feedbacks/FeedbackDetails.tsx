import React, { FunctionComponent } from 'react';
import { graphql, useFragment } from 'react-relay';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';
import { useFormatter } from '../../../../components/i18n';
import {
  FeedbackDetails_case$data,
  FeedbackDetails_case$key,
} from './__generated__/FeedbackDetails_case.graphql';
import ItemOpenVocab from '../../../../components/ItemOpenVocab';
import RatingField from '../../../../components/RatingField';

const styles = makeStyles(() => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: '15px',
    borderRadius: 6,
  },
}));

const FeedbackDetailsFragment = graphql`
  fragment FeedbackDetails_case on Case {
    id
    name
    description
    case_type
    priority
    severity
    rating
    created
    modified
    created_at
    objectLabel {
      edges {
        node {
          id
          value
          color
        }
      }
    }
    name
    x_opencti_stix_ids
    status {
      id
      order
      template {
        name
        color
      }
    }
    workflowEnabled
  }
`;

interface FeedbackDetailsProps {
  caseData: FeedbackDetails_case$key;
}

const FeedbackDetails: FunctionComponent<FeedbackDetailsProps> = ({
  caseData,
}) => {
  const { t } = useFormatter();
  const classes = styles();
  const data: FeedbackDetails_case$data = useFragment(
    FeedbackDetailsFragment,
    caseData,
  );
  return (
    <div style={{ height: '100%' }}>
      <Typography variant="h4" gutterBottom={true}>
        {t('Details')}
      </Typography>
      <Paper classes={{ root: classes.paper }} variant="outlined">
        <Grid container={true} spacing={3}>
          <Grid item={true} xs={6}>
            <Typography variant="h3" gutterBottom={true}>
              {t('Type')}
            </Typography>
            <ItemOpenVocab
              key="type"
              small={true}
              type="case_types_ov"
              value={data.case_type}
            />
          </Grid>
          <Grid item={true} xs={6}>
            <Typography variant="h3" gutterBottom={true}>
              {t('Rating')}
            </Typography>
            <RatingField rating={data.rating} size="small" readOnly={true} />
          </Grid>
          <Grid item={true} xs={6}>
            <Typography variant="h3" gutterBottom={true}>
              {t('Priority')}
            </Typography>
            <ItemOpenVocab
              key="type"
              small={true}
              type="case_priority_ov"
              value={data.priority}
            />
          </Grid>
          <Grid item={true} xs={6}>
            <Typography variant="h3" gutterBottom={true}>
              {t('Severity')}
            </Typography>
            <ItemOpenVocab
              key="type"
              small={true}
              type="case_severity_ov"
              value={data.severity}
            />
          </Grid>
          <Grid item={true} xs={12}>
            <Typography variant="h3" gutterBottom={true}>
              {t('Description')}
            </Typography>
            {data.description && (
              <ExpandableMarkdown source={data.description} limit={300} />
            )}
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};
export default FeedbackDetails;
