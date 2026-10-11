import * as path from 'path';
import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import { TsLambda } from './constructs/ts-lambda';

export interface SchedulerStackProps extends StackProps {
  table: dynamodb.ITable;
}

export class SchedulerStack extends Stack {
  public readonly nightlyHealthDecayFn: TsLambda;
  public readonly nightlyDecayRule: events.Rule;

  constructor(scope: Construct, id: string, props: SchedulerStackProps) {
    super(scope, id, props);

    const { table } = props;
    const apiBasePath = path.resolve(__dirname, '../../services/api/src');

    // 1. Nightly Health Decay Lambda Function
    this.nightlyHealthDecayFn = new TsLambda(this, 'NightlyHealthDecayFunction', {
      entry: path.join(apiBasePath, 'handlers/scheduler/nightlyHealthDecay.ts'),
      serviceName: 'saafsafari-nightly-health-decay',
      timeout: Duration.minutes(2),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(this.nightlyHealthDecayFn);

    // 2. EventBridge Rule: Triggered nightly at midnight UTC (5:30 AM IST)
    this.nightlyDecayRule = new events.Rule(this, 'NightlyHealthDecayRule', {
      ruleName: 'saafsafari-nightly-health-decay',
      description: 'Applies 3% nightly health decay across 68 Delhi NCR territories',
      schedule: events.Schedule.expression('cron(0 0 * * ? *)'),
      targets: [new targets.LambdaFunction(this.nightlyHealthDecayFn)],
    });

    // CloudFormation Outputs
    new CfnOutput(this, 'NightlyDecayRuleArnOutput', {
      value: this.nightlyDecayRule.ruleArn,
      description: 'EventBridge Nightly Health Decay Rule ARN',
      exportName: 'SaafSafari-NightlyDecayRuleArn',
    });
  }
}
