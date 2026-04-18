import { Component, Input } from '@angular/core';
import { LocationData } from '../../services/dashboard.service';

interface SafetyStatus {
  status: 'SAFE' | 'CAUTION' | 'UNSAFE';
  label: string;
  color: string;
  icon: string;
  reason: string;
}

@Component({
  selector: 'app-location-card',
  standalone: false,
  templateUrl: './location-card.component.html',
  styleUrls: ['./location-card.component.scss']
})
export class LocationCardComponent {
  @Input() location!: LocationData;

  getLocationIcon(location: string): string {
    return '📍';
  }

  getSafetyStatus(): SafetyStatus {
    const iceThickness = this.location.avgIceThickness || 0;
    const surfaceTemp = this.location.avgSurfaceTemperature || 0;
    const maxTemp = this.location.maxSurfaceTemperature || 0;

    // Safety thresholds for Rideau Canal ice
    // Safe: >= 15cm ice thickness with cold temps
    // Caution: 10-15cm or warming trend
    // Unsafe: < 10cm or warming significantly

    if (iceThickness < 10 || maxTemp > 0) {
      // Unsafe: thin ice or above freezing temperatures
      return {
        status: 'UNSAFE',
        label: 'UNSAFE',
        color: '#dc3545',
        icon: '⚠️',
        reason: iceThickness < 10 ? 'Thin ice' : 'Above freezing'
      };
    } else if (iceThickness < 15 || (maxTemp > -5 && surfaceTemp > -3)) {
      // Caution: marginal conditions
      return {
        status: 'CAUTION',
        label: 'CAUTION',
        color: '#ffc107',
        icon: '⚡',
        reason: iceThickness < 15 ? 'Marginal thickness' : 'Warming trend'
      };
    } else {
      // Safe: solid ice and cold temps
      return {
        status: 'SAFE',
        label: 'SAFE',
        color: '#28a745',
        icon: '✓',
        reason: 'Good conditions'
      };
    }
  }
}
