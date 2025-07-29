import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MonacoCodeEditorComponent } from './monaco-code-editor.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Submission } from '../models/submission.model';
import { Exercise } from '../models/exercise.model';
import { Language } from '../models/language.model';
import {TestResult} from '../models/test-result.model'
import { CodeExecutionService } from '../services/code-execution.service';

@Component({
  selector: 'app-code-runner',
  standalone: true,
  imports: [MonacoCodeEditorComponent, CommonModule, FormsModule, RouterModule],
  template: `
<div class="container-fluid">
  <div class="row" *ngIf="exercise">
    <div class="col-md-6">
      <div class="card h-100">
        <div class="card-header">
          <h5>{{ exercise.title }}</h5>
          <span class="badge" [ngClass]="getDifficultyClass(exercise.difficulty)">
            {{ getDifficultyText(exercise.difficulty) }}
          </span>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <h6>Mô tả:</h6>
            <p>{{ exercise.description }}</p>
          </div>
          <div class="mb-3" *ngIf="exercise.sampleInput">
            <h6>Input mẫu:</h6>
            <pre class="bg-light p-2">{{ exercise.sampleInput }}</pre>
          </div>
          <div class="mb-3" *ngIf="exercise.sampleOutput">
            <h6>Output mẫu:</h6>
            <pre class="bg-light p-2">{{ exercise.sampleOutput }}</pre>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card h-100">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6>Code Editor</h6>
          <div class="d-flex align-items-center">
            <label class="me-2">Ngôn ngữ:</label>
            <select class="form-select w-auto" [(ngModel)]="selectedLanguageId">
              <option [value]="null" disabled>Chọn ngôn ngữ</option>
              <option *ngFor="let lang of languages" [value]="lang.id">
                {{ lang.name }} (Judge0: {{ lang.code }})
              </option>
            </select>
          </div>
        </div>
        <div class="card-body p-0">
          <app-monaco-code-editor #codeEditor></app-monaco-code-editor>
        </div>
        <div class="card-footer">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <small class="text-muted" *ngIf="selectedLanguageId">
                Selected Language ID: {{ selectedLanguageId }}
                <span *ngIf="getSelectedLanguage()"> | Judge0 Code: {{ getSelectedLanguage()!.code }}</span>
              </small>
            </div>
            <button
              class="btn btn-primary"
              (click)="submitCode()"
              [disabled]="submitting || !selectedLanguageId">
              <span *ngIf="submitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ submitting ? 'Đang chạy...' : 'Submit' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading state -->
  <div class="row" *ngIf="languages.length === 0">
    <div class="col-12 text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Đang tải ngôn ngữ...</span>
      </div>
      <p>Đang tải danh sách ngôn ngữ lập trình...</p>
    </div>
  </div>

  <!-- Results -->
  <div class="row mt-3" *ngIf="latestSubmission">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h6>Kết quả</h6>
          <span class="badge" [ngClass]="getStatusClass(latestSubmission.status)">
            {{ getStatusText(latestSubmission.status) }}
          </span>
        </div>
        <div class="card-body">
        <!-- Thêm phần so sánh kết quả -->
        <div *ngIf="testResult" class="mb-3">
          <h6>Kiểm tra kết quả:</h6>
          <div class="alert" [ngClass]="testResult.passed ? 'alert-success' : 'alert-danger'">
            {{ testResult.message }}
          </div>
          <div class="row">
            <div class="col-md-6">
              <h6>Output của bạn:</h6>
              <pre class="bg-light p-2">{{ testResult.actualOutput || 'Không có output' }}</pre>
            </div>
            <div class="col-md-6" *ngIf="testResult.expectedOutput">
              <h6>Output mong đợi:</h6>
              <pre class="bg-light p-2">{{ testResult.expectedOutput }}</pre>
            </div>
          </div>
        </div>

          <div *ngIf="latestSubmission.stderr">
            <h6>Error:</h6>
            <pre class="bg-danger text-white p-2">{{ latestSubmission.stderr }}</pre>
          </div>
          <div *ngIf="latestSubmission.compileOutput">
            <h6>Compile Output:</h6>
            <pre class="bg-warning p-2">{{ latestSubmission.compileOutput }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- History -->
  <div class="row mt-3" *ngIf="submissions.length > 0">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h6>Lịch sử nộp bài</h6>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Ngôn ngữ</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let sub of submissions">
                  <td>{{ formatDate(sub.createdAt) }}</td>
                  <td>{{ sub.languageName }}</td>
                  <td>
                    <span class="badge" [ngClass]="getStatusClass(sub.status)">
                      {{ getStatusText(sub.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `
})

export class CodeRunnerComponent implements OnInit {
  @ViewChild('codeEditor') codeEditor!: MonacoCodeEditorComponent;

  exercise: Exercise | null = null;
  languages: Language[] = [];
  submissions: Submission[] = [];
  latestSubmission: Submission | null = null;
  selectedLanguageId: number | null = null; // THAY ĐỔI: null thay vì 71
  submitting = false;
  exerciseId: number | null = null;
  testResult: TestResult | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private codeExecution: CodeExecutionService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['exerciseId']) {
        this.exerciseId = +params['exerciseId'];
        this.loadExercise();
        this.loadSubmissions();
      }
    });
    this.loadLanguages();
  }

  loadLanguages() {
    this.apiService.getLanguages().subscribe({
      next: (languages) => {
        this.languages = languages;
        // TỰ ĐỘNG CHỌN PYTHON LÀM DEFAULT NẾU CÓ
        const pythonLang = languages.find(lang => lang.name.toLowerCase().includes('python'));
        if (pythonLang) {
          this.selectedLanguageId = pythonLang.code;
        } else if (languages.length > 0) {
          // Nếu không có Python, chọn language đầu tiên
          this.selectedLanguageId = languages[0].code;
        }
        console.log('Languages loaded:', languages);
        console.log('Selected language ID:', this.selectedLanguageId);
      },
      error: (error) => {
        console.error('Error loading languages:', error);
        alert('Không thể tải danh sách ngôn ngữ lập trình');
      }
    });
  }

  submitCode() {
    if (!this.exerciseId) {
      alert('Không tìm thấy bài tập');
      return;
    }

    if (!this.authService.isLoggedIn()) {
      alert('Bạn cần đăng nhập để nộp bài');
      this.router.navigate(['/login']);
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Không thể xác định người dùng');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.selectedLanguageId) {
      alert('Vui lòng chọn ngôn ngữ lập trình');
      return;
    }

    const code = this.codeEditor.getCode();
    if (!code.trim()) {
      alert('Vui lòng nhập code');
      return;
    }

    this.submitting = true;
    // Reset kết quả cũ
    this.testResult = null;

    const submission = {
      languageId: this.selectedLanguageId,
      sourceCode: code
    };

    console.log('Submitting:', submission);

    this.codeExecution.submitCode(submission.sourceCode,submission.languageId).subscribe({
      next: (result) => {
        console.log('Submit success:', result);


        this.latestSubmission = result;
        console.log("data",this.latestSubmission)

        // Thực hiện so sánh kết quả
        this.compareResults(result);

        this.loadSubmissions();
        this.submitting = false;

        // Hiển thị thông báo thành công
        alert('Nộp bài thành công! Đang xử lý...');
      },
      error: (error) => {
        console.error('Submit error:', error);
        this.submitting = false;

        if (error.error?.error) {
          alert('Lỗi: ' + error.error.error);
        } else if (error.error?.message) {
          alert('Lỗi: ' + error.error.message);
        } else {
          alert('Có lỗi xảy ra khi nộp bài: ' + error.message);
        }
      }
    });
  }

compareResults(submission: Submission) {
  if (!this.exercise) {
    this.testResult = {
      passed: false,
      actualOutput: submission.stdout || '',
      expectedOutput: 'Không có bài tập để so sánh',
      message: 'Không thể so sánh do thiếu thông tin bài tập'
    };

    // Nếu không có exercise thì đặt trạng thái FAIL
    submission.status = 'FAIL';
    return;
  }

  // Lấy output thực tế từ submission
  const actualOutput = (submission.stdout || '').trim();
  let expectedOutput = '';
  let passed = false;

  if (this.exercise.sampleOutput) {
    expectedOutput = this.exercise.sampleOutput.trim();
    passed = actualOutput === expectedOutput;
  } else {
    // Nếu không có sampleOutput, coi như passed nếu có stdout và không có lỗi
    passed = !!actualOutput && !submission.stderr && !submission.compileOutput;
    expectedOutput = 'Không có output mẫu để so sánh';
  }

  // Cập nhật testResult
  this.testResult = {
    passed: passed,
    actualOutput: actualOutput,
    expectedOutput: expectedOutput,
    message: passed
      ? 'Chính xác! Output khớp với kết quả mong đợi.'
      : 'Sai! Output không khớp với kết quả mong đợi.'
  };

  // Cập nhật trạng thái cho submission
  submission.status = passed ? 'SUCCESS' : 'FAIL';
}


  // Rest of methods remain the same...
  loadExercise() {
    if (this.exerciseId) {
      this.apiService.getExerciseById(this.exerciseId).subscribe({
        next: (exercise) => {
          this.exercise = exercise;
        },
        error: (error) => {
          console.error('Error loading exercise:', error);
        }
      });
    }
  }

  loadSubmissions() {
    if (this.exerciseId && this.authService.isLoggedIn()) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.apiService.getMySubmissionsForExercise(currentUser.id, this.exerciseId).subscribe({
          next: (submissions) => {
            this.submissions = submissions;
          },
          error: (error) => {
            console.error('Error loading submissions:', error);
          }
        });
      }
    }
  }

  getDifficultyClass(difficulty: string): string {
    switch (difficulty) {
      case 'EASY': return 'bg-success';
      case 'MEDIUM': return 'bg-warning text-dark';
      case 'HARD': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getDifficultyText(difficulty: string): string {
    switch (difficulty) {
      case 'EASY': return 'Dễ';
      case 'MEDIUM': return 'Trung bình';
      case 'HARD': return 'Khó';
      default: return difficulty;
    }
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

  // Helper methods cho template
  getSelectedLanguage(): Language | null {
    if (!this.selectedLanguageId) return null;
    return this.languages.find(lang => lang.id === this.selectedLanguageId) || null;
  }

  getSelectedLanguageCode(): number | null {
    const selectedLang = this.getSelectedLanguage();
    return selectedLang ? selectedLang.code : null;
  }
}
