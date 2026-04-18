import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LocationData {
  location: string;
  timestamp: string;
  avgIceThickness: number;
  maxIceThickness: number;
  minIceThickness: number;
  avgSurfaceTemperature: number;
  maxSurfaceTemperature: number;
  minSurfaceTemperature: number;
  avgSnowAccumulation: number;
  maxSnowAccumulation: number;
  minSnowAccumulation: number;
  avgExternalTemperature: number;
  maxExternalTemperature: number;
  minExternalTemperature: number;
}

export interface LatestResponse {
  success: boolean;
  timestamp: string;
  data: LocationData[];
}

export interface HistoryResponse {
  success: boolean;
  data: LocationData[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLatestData(): Observable<LatestResponse> {
    return this.http.get<LatestResponse>(`${this.apiUrl}/latest`);
  }

  getHistoryData(location: string): Observable<HistoryResponse> {
    return this.http.get<HistoryResponse>(`${this.apiUrl}/history/${encodeURIComponent(location)}`);
  }
}
