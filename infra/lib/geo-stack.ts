import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import * as location from 'aws-cdk-lib/aws-location';
import { Construct } from 'constructs';

export class GeoStack extends Stack {
  public readonly map: location.CfnMap;
  public readonly geofenceCollection: location.CfnGeofenceCollection;
  public readonly tracker: location.CfnTracker;
  public readonly mapsApiKey: location.CfnAPIKey;

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

    // Link the truck tracker to the territory geofences: every truck position is evaluated
    // against the H3 territory hexes and ENTER/EXIT events go to the default EventBridge bus.
    const trackerConsumer = new location.CfnTrackerConsumer(this, 'TruckTerritoryGeofenceConsumer', {
      trackerName: this.tracker.trackerName,
      consumerArn: this.geofenceCollection.attrArn,
    });
    trackerConsumer.addDependency(this.tracker);
    trackerConsumer.addDependency(this.geofenceCollection);

    // Amazon Location Maps API v2 key used by the mobile map (tiles + style only).
    // The API reads the key value at runtime with geo:DescribeKey and hands the app a style URL.
    this.mapsApiKey = new location.CfnAPIKey(this, 'MapsApiKey', {
      keyName: 'saafsafari-maps-key',
      description: 'Read-only map tiles for the SaafSafari mobile app',
      noExpiry: true,
      restrictions: {
        allowActions: ['geo-maps:GetTile', 'geo-maps:GetStaticMap'],
        allowResources: [`arn:aws:geo-maps:${this.region}::provider/default`],
      },
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

    new CfnOutput(this, 'MapsApiKeyNameOutput', {
      value: this.mapsApiKey.keyName,
      description: 'Amazon Location Maps API key name',
      exportName: 'SaafSafari-MapsApiKeyName',
    });
  }
}
