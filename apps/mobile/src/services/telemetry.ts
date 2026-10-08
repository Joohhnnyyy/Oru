import { api } from './api';

export interface TelemetryPoint {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
}

class TelemetryService {
  private intervalId: any = null;
  private isBroadcasting = false;
  private currentCoordIndex = 0;

  // Simulated route path through MCD South 34 (Lajpat Nagar ward)
  private routePath: [number, number][] = [
    [28.5672, 77.2435],
    [28.5681, 77.2442],
    [28.5695, 77.2458],
    [28.5708, 77.2472],
    [28.5721, 77.2486],
    [28.5710, 77.2465],
  ];

  startBroadcasting(
    vehicleId: string = 'DL-1M-4821',
    onUpdate?: (point: TelemetryPoint) => void,
  ) {
    if (this.isBroadcasting) return;
    this.isBroadcasting = true;

    this.intervalId = setInterval(async () => {
      const coord = this.routePath[this.currentCoordIndex];
      this.currentCoordIndex = (this.currentCoordIndex + 1) % this.routePath.length;

      const point: TelemetryPoint = {
        latitude: coord[0],
        longitude: coord[1],
        speed: 18.5,
        heading: 45,
        timestamp: new Date().toISOString(),
      };

      try {
        await api.sendTelemetry({
          vehicleId,
          latitude: point.latitude,
          longitude: point.longitude,
          speed: point.speed,
          heading: point.heading,
        });
      } catch (err) {
        // Continue simulation even if network is offline
      }

      if (onUpdate) {
        onUpdate(point);
      }
    }, 15000);
  }

  stopBroadcasting() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isBroadcasting = false;
  }

  getStatus() {
    return this.isBroadcasting;
  }
}

export const telemetryService = new TelemetryService();
