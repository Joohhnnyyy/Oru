import * as path from 'path';
import { Duration } from 'aws-cdk-lib';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export interface TsLambdaProps extends Partial<NodejsFunctionProps> {
  entry: string;
  handler?: string;
  serviceName?: string;
}

export class TsLambda extends NodejsFunction {
  constructor(scope: Construct, id: string, props: TsLambdaProps) {
    const {
      entry,
      handler = 'handler',
      serviceName = 'saafsafari-api',
      environment,
      timeout = Duration.seconds(15),
      memorySize = 256,
      ...restProps
    } = props;

    super(scope, id, {
      entry,
      handler,
      runtime: Runtime.NODEJS_22_X,
      architecture: Architecture.ARM_64,
      timeout,
      memorySize,
      environment: {
        POWERTOOLS_SERVICE_NAME: serviceName,
        POWERTOOLS_LOG_LEVEL: 'INFO',
        NODE_OPTIONS: '--enable-source-maps',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        ...environment,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node22',
        format: OutputFormat.ESM,
        mainFields: ['module', 'main'],
        banner: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
        ...restProps.bundling,
      },
      ...restProps,
    });
  }
}
