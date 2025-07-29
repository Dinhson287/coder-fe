import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Submission } from '../models/submission.model';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-my-submissions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-submissions.component.html',
  styleUrl: './my-submissions.component.scss'
})
export class MySubmissionsComponent implements OnInit {
  submissions: Submission[] = [];
  loading = true;
  error = '';
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  showModal = false;
  selectedSubmission: Submission | null = null;

  constructor(private apiService: ApiService,private authService: AuthService) {}

  ngOnInit() {
    this.loadSubmissions();
  }

loadSubmissions() {
  const currentUser = this.authService.getCurrentUser();
  if (!currentUser) {
    this.error = 'Không thể xác định người dùng';
    this.loading = false;
    return;
  }

  this.loading = true;
  this.apiService.getMySubmissionsPaged(currentUser.id, this.currentPage, this.pageSize).subscribe({
    next: (response) => {
      this.submissions = response.content;
      this.totalPages = response.totalPages;
      this.loading = false;
    },
    error: (error) => {
      this.error = 'Không thể tải danh sách bài nộp';
      this.loading = false;
    }
  });
}

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadSubmissions();
    }
  }

  getPageNumbers(): number[] {
    const maxVisible = 5;
    const start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  viewDetails(submission: Submission) {
    this.selectedSubmission = submission;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedSubmission = null;
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
