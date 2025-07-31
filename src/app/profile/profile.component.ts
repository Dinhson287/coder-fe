import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { Submission } from '../models/submission.model';
import { User } from '../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  submissions: Submission[] = [];
  stats: any = {
    totalSubmissions: 0,
    successfulSubmissions: 0,
    successRate: 0
  };
  loading = true;

  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadUserStats();
      this.loadRecentSubmissions();
    }
  }

  loadUserStats() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.apiService.getMySubmissionStats(currentUser.id).subscribe({
        next: (stats) => {
          this.processStats(stats);
        },
        error: (error) => {
          console.error('Error loading stats:', error);
        }
      });
    }
  }

  loadRecentSubmissions() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.apiService.getMySubmissions(currentUser.id).subscribe({
        next: (submissions) => {
          this.submissions = submissions.slice(0, 10);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading submissions:', error);
          this.loading = false;
        }
      });
    }
  }

  processStats(stats: any[]) {
    let totalSubmissions = 0;
    let successfulSubmissions = 0;

    stats.forEach(stat => {
      const [status, count] = stat;
      totalSubmissions += count;
      if (status === 'SUCCESS') {
        successfulSubmissions = count;
      }
    });

    this.stats = {
      totalSubmissions,
      successfulSubmissions,
      successRate: totalSubmissions > 0 ? (successfulSubmissions / totalSubmissions * 100).toFixed(1) : 0
    };
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'SUCCESS': return 'bg-success';
      case 'FAIL': return 'bg-danger';
      case 'ERROR': return 'bg-warning text-dark';
      case 'PENDING': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'SUCCESS': return 'Thành công';
      case 'FAIL': return 'Sai';
      case 'ERROR': return 'Lỗi';
      case 'PENDING': return 'Đang chờ';
      default: return status;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('vi-VN');
  }
}
