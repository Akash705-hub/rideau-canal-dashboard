import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService, LocationData } from '../../services/dashboard.service';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  locations: LocationData[] = [];
  lastUpdateTime: Date = new Date();
  isLoading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();
  private readonly REFRESH_INTERVAL = 30000; // 30 seconds

  constructor(
    private dashboardService: DashboardService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboard(): void {
    console.log('Dashboard API response:');
    this.dashboardService.getLatestData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Dashboard API response:', response);
          this.isLoading = false;

          if (response?.success) {
            this.locations = response.data || [];
            this.lastUpdateTime = new Date();
            this.error = null;
            if (this.locations.length === 0) {
              this.error = 'No dashboard data available yet';
            }
          } else {
            this.error = 'Unexpected API response from /api/latest';
          }

          this.changeDetectorRef.detectChanges();
        },
        error: (err) => {
          console.error('Dashboard load error:', err);
          this.error = 'Failed to load dashboard data';
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  private setupAutoRefresh(): void {
    interval(this.REFRESH_INTERVAL)
      .pipe(
        switchMap(() => this.dashboardService.getLatestData()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.locations = response.data;
            this.lastUpdateTime = new Date();
            this.changeDetectorRef.detectChanges();
          }
        },
        error: (err) => console.error('Auto-refresh error:', err)
      });
  }

  getLocationKey(location: string): string {
    const mapping: { [key: string]: string } = {
      "Dow's Lake": "dows",
      "Fifth Avenue": "fifth",
      "NAC": "nac"
    };
    return mapping[location] || location.toLowerCase().replace(/[^a-z]/g, '');
  }
}
