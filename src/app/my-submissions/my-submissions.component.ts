import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Submission } from '../models/submission.model';
import { Language } from '../models/language.model';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-my-submissions',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-submissions.component.html',
  styleUrl: './my-submissions.component.scss'
})
export class MySubmissionsComponent implements OnInit {
  submissions: Submission[] = [];
  languages: Language[] = [];
  loading = true;
  error = '';
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  showModal = false;
  selectedSubmission: Submission | null = null;

  // Filter properties
  selectedLanguageId: number | null = null;
  selectedStatus: string = '';
  exerciseKeyword: string = '';

  // Delete confirmation
  showDeleteModal = false;
  submissionToDelete: Submission | null = null;

  // Debounce timer for search
  private searchTimeout: any;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadLanguages();
    this.loadSubmissions();
  }

  loadLanguages() {
    this.apiService.getLanguages().subscribe({
      next: (languages) => {
        this.languages = languages;
      },
      error: (error) => {
        console.error('Error loading languages:', error);
      }
    });
  }

  loadSubmissions() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'Không thể xác định người dùng';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';

    // Build filter parameters
    const filters = {
      languageId: this.selectedLanguageId,
      status: this.selectedStatus || null,
      exerciseKeyword: this.exerciseKeyword || null
    };

    this.apiService.getMySubmissionsPagedWithFilters(
      currentUser.id,
      this.currentPage,
      this.pageSize,
      filters
    ).subscribe({
      next: (response) => {
        this.submissions = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading submissions:', error);
        this.error = 'Không thể tải danh sách bài nộp';
        this.loading = false;
      }
    });
  }

  onFilterChange() {
    // Clear timeout if it exists
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set a debounce for text input
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 0; // Reset to first page when filtering
      this.loadSubmissions();
    }, 300);
  }

  clearFilters() {
    this.selectedLanguageId = null;
    this.selectedStatus = '';
    this.exerciseKeyword = '';
    this.currentPage = 0;
    this.loadSubmissions();
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedLanguageId || this.selectedStatus || this.exerciseKeyword);
  }

  getLanguageName(languageId: number): string {
    const language = this.languages.find(l => l.id === languageId);
    return language ? language.name : 'Unknown';
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
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

  goToExercise(exerciseId: number) {
    this.closeModal();
    this.router.navigate(['/code'], { queryParams: { exerciseId: exerciseId } });
  }

  confirmDeleteSubmission(submission: Submission) {
    this.submissionToDelete = submission;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.submissionToDelete = null;
  }

  deleteSubmission() {
    if (!this.submissionToDelete) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'Không thể xác định người dùng';
      return;
    }

    this.apiService.deleteSubmission(this.submissionToDelete.id, currentUser.id).subscribe({
      next: () => {
        this.cancelDelete();
        this.loadSubmissions(); // Reload submissions after deletion
        // Show success message (you can implement toast notification)
        console.log('Submission deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting submission:', error);
        this.error = 'Không thể xóa bài nộp';
        this.cancelDelete();
      }
    });
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
