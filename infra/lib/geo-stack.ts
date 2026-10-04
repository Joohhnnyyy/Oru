import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import * as location from 'aws-cdk-lib/aws-location';
import { Construct } from 'constructs';

export class GeoStack extends Stack {
  public readonly map: location.CfnMap;
  public readonly geofenceCollection: location.CfnGeofenceCollection;
  public readonly tracker: location.CfnTracker;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Amazon Location Service Map
    this.map = new location.CfnMap(this, 'SaafSafariMap', {
      mapName: 'saafsafari-map',
      configuration: {
        style: 'VectorOpenDataStandardLight',
      },
      description: 'SaafSafari base map for civic waste tracking',
    });

    // Amazon Location Service Geofence Collection
    this.geofenceCollection = new location.CfnGeofenceCollection(this, 'SaafSafariGeofences', {
      collectionName: 'saafsafari-geofences',
      description: 'Geofence boundaries for municipal wards and collection zones',
    });

    // Amazon Location Service Tracker for municipal waste collection vehicles
    this.tracker = new location.CfnTracker(this, 'SaafSafariTracker', {
      trackerName: 'saafsafari-truck-tracker',
      positionFiltering: 'TimeBased',
      description: 'Tracker for waste collection vehicles and live route tracking',
    });

    // CloudFormation Outputs
    new CfnOutput(this, 'MapNameOutput', {
      value: this.map.mapName,
      description: 'Amazon Location Map Name',
      exportName: 'SaafSafari-MapName',
    });

    new CfnOutput(this, 'GeofenceCollectionNameOutput', {
      value: this.geofenceCollection.collectionName,
      description: 'Amazon Location Geofence Collection Name',
      exportName: 'SaafSafari-GeofenceCollectionName',
    });

    new CfnOutput(this, 'TrackerNameOutput', {
      value: this.tracker.trackerName,
      description: 'Amazon Location Tracker Name',
      exportName: 'SaafSafari-TrackerName',
    });
  }
}
