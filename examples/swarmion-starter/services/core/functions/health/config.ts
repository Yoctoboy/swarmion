import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import {
  getAppConfig,
  sharedLambdaEsbuildConfig,
} from '@swarmion-starter/cdk-configuration';
import { healthContract } from '@swarmion-starter/core-contracts';

import { CORS_ALLOWED_ORIGINS } from 'shared/constants';

type HealthProps = { restApi: RestApi };

export class Health extends Construct {
  public healthFunction: NodejsFunction;

  constructor(scope: Construct, id: string, { restApi }: HealthProps) {
    super(scope, id);

    const {
      restApiConfig: { allowedOrigins },
    } = getAppConfig(this);

    const environment: Record<string, string> = {
      [CORS_ALLOWED_ORIGINS]: JSON.stringify(allowedOrigins),
    };

    this.healthFunction = new NodejsFunction(this, 'Lambda', {
      entry: getCdkHandlerPath(__dirname),
      handler: 'main',
      runtime: Runtime.NODEJS_22_X,
      architecture: Architecture.ARM_64,
      awsSdkConnectionReuse: true,
      bundling: sharedLambdaEsbuildConfig,
      environment,
    });

    restApi.root
      .resourceForPath(healthContract.path)
      .addMethod(
        healthContract.method,
        new LambdaIntegration(this.healthFunction),
      );
  }
}
