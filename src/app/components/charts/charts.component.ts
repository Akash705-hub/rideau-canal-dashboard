import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { DashboardService, LocationData } from '../../services/dashboard.service';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-charts',
  standalone: false,
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit, OnDestroy {
  iceThicknessChartConfig: ChartConfiguration = {} as any;
  temperatureChartConfig: ChartConfiguration = {} as any;
  isLoading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();
  private readonly locations = ["Dow's Lake", "Fifth Avenue", "NAC"];
  private readonly colors = {
    "Dow's Lake": 'rgb(75, 192, 192)',
    "Fifth Avenue": 'rgb(255, 99, 132)',
    "NAC": 'rgb(54, 162, 235)'
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadCharts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCharts(): void {
    const historyRequests = this.locations.map((location) =>
      this.dashboardService.getHistoryData(location).pipe(
        map((response) => ({
          location,
          data: response?.data || []
        })),
        catchError((err) => {
          console.error(`History load failed for ${location}:`, err);
          return of({ location, data: [] as LocationData[] });
        })
      )
    );

    forkJoin(historyRequests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history) => {
          const firstWithData = history.find((h) => h.data.length > 0);

          if (!firstWithData) {
            this.error = 'No chart data available yet';
            this.isLoading = false;
            return;
          }

          this.buildCharts(history);
          this.error = null;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Charts load error:', err);
          this.error = 'Failed to load chart data';
          this.isLoading = false;
        }
      });
  }

  private buildCharts(history: Array<{ location: string; data: LocationData[] }>): void {
    const labelsSource = history.find((h) => h.data.length > 0)?.data || [];

    const labels = labelsSource.map(d =>
      new Date(d.timestamp).toLocaleTimeString('en-CA', {
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    // Ice thickness datasets
    const iceDatasets = history.map(({ location, data }) => ({
      label: location,
      data: data.map(d => d.avgIceThickness),
      borderColor: this.colors[location as keyof typeof this.colors],
      backgroundColor: this.colors[location as keyof typeof this.colors] + '33',
      tension: 0.4,
      fill: false
    }));

    // Temperature datasets
    const tempDatasets = history.map(({ location, data }) => ({
      label: location,
      data: data.map(d => d.avgSurfaceTemperature),
      borderColor: this.colors[location as keyof typeof this.colors],
      backgroundColor: this.colors[location as keyof typeof this.colors] + '33',
      tension: 0.4,
      fill: false
    }));

    this.iceThicknessChartConfig = {
      type: 'line',
      data: {
        labels,
        datasets: iceDatasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: {
            title: { display: true, text: 'Ice Thickness (cm)' }
          }
        }
      }
    };

    this.temperatureChartConfig = {
      type: 'line',
      data: {
        labels,
        datasets: tempDatasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: {
            title: { display: true, text: 'Surface Temperature (°C)' }
          }
        }
      }
    };
  }
}
