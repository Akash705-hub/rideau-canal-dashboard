import { Component, Input } from '@angular/core';
import { LocationData } from '../../services/dashboard.service';

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
}
