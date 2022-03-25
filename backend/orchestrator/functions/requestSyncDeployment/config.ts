import { requestSyncDeployment } from '@swarmion/orchestrator-contracts';
import { getHandlerPath, LambdaFunction } from '@swarmion/serverless-helpers';

const config: LambdaFunction = {
  environment: {
    ORCHESTRATOR_TABLE_NAME: { Ref: 'OrchestratorTable' },
  },
  handler: getHandlerPath(__dirname),
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Resource: { 'Fn::GetAtt': ['OrchestratorTable', 'Arn'] },
      Action: ['dynamodb:PutItem'],
    },
  ],
  iamRoleStatementsInherit: true,
  events: [requestSyncDeployment.trigger],
};

export default config;