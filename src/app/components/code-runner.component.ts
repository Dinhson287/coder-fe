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
import { TestResult } from '../models/test-result.model'
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
            <select class="form-select w-auto" [(ngModel)]="selectedLanguageId" (ngModelChange)="onLanguageChange($event)">
              <option [value]="null" disabled>Chọn ngôn ngữ</option>
              <option *ngFor="let lang of languages" [value]="lang.id">
                {{ lang.name }} ({{ lang.code }})
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

          <!-- Hiển thị thông tin execution -->
          <div *ngIf="latestSubmission.time" class="mt-3">
            <small class="text-muted">
              <span *ngIf="latestSubmission.time">Thời gian: {{ latestSubmission.time }}s</span>
              <span *ngIf="latestSubmission.time"> | </span>
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- History -->
  <div class="row mt-3" *ngIf="submissions.length > 0">
    <div class="col-12">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6>Lịch sử nộp bài</h6>
          <button class="btn btn-sm btn-outline-primary" (click)="loadSubmissions()">
            <i class="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Ngôn ngữ</th>
                  <th>Trạng thái</th>
                  <th>Thời gian chạy</th>
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
                  <td>{{ sub.time ? sub.time + 's' : '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Submission Details Modal -->
  <div class="modal fade" id="submissionModal" tabindex="-1" *ngIf="selectedSubmissionDetail">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Chi tiết Submission</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <strong>Trạng thái:</strong>
            <span class="badge ms-2" [ngClass]="getStatusClass(selectedSubmissionDetail.status)">
              {{ getStatusText(selectedSubmissionDetail.status) }}
            </span>
          </div>
          <div class="mb-3">
            <strong>Ngôn ngữ:</strong> {{ selectedSubmissionDetail.languageName }}
          </div>
          <div class="mb-3">
            <strong>Thời gian nộp:</strong> {{ formatDate(selectedSubmissionDetail.createdAt) }}
          </div>
          <div class="mb-3">
            <strong>Source Code:</strong>
            <pre class="bg-light p-2">{{ selectedSubmissionDetail.sourceCode }}</pre>
          </div>
          <div class="mb-3" *ngIf="selectedSubmissionDetail.stdout">
            <strong>Output:</strong>
            <pre class="bg-light p-2">{{ selectedSubmissionDetail.stdout }}</pre>
          </div>
          <div class="mb-3" *ngIf="selectedSubmissionDetail.stderr">
            <strong>Error:</strong>
            <pre class="bg-danger text-white p-2">{{ selectedSubmissionDetail.stderr }}</pre>
          </div>
          <div class="mb-3" *ngIf="selectedSubmissionDetail.compileOutput">
            <strong>Compile Output:</strong>
            <pre class="bg-warning p-2">{{ selectedSubmissionDetail.compileOutput }}</pre>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
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
  selectedLanguageId: number | null = null;
  submitting = false;
  exerciseId: number | null = null;
  testResult: TestResult | null = null;
  selectedSubmissionDetail: Submission | null = null;

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
        console.log('Languages loaded:', languages);

        const pythonLang = languages.find(lang => lang.name.toLowerCase().includes('python'));
        if (pythonLang) {
          this.selectedLanguageId = pythonLang.id;
          console.log('Auto-selected Python:', pythonLang);
        } else if (languages.length > 0) {
          this.selectedLanguageId = languages[0].id;
          console.log('Auto-selected first language:', languages[0]);
        }

        console.log('Selected language ID:', this.selectedLanguageId);
        console.log('Selected language object:', this.getSelectedLanguage());
      },
      error: (error) => {
        console.error('Error loading languages:', error);
        alert('Không thể tải danh sách ngôn ngữ lập trình');
      }
    });
  }

  onLanguageChange(languageId: number | null) {
    console.log('Language changed to:', languageId);
    console.log('Selected language object:', this.getSelectedLanguage());
  }

  async submitCode() {
    console.log('=== SUBMIT CODE DEBUG ===');
    console.log('Exercise ID:', this.exerciseId);
    console.log('Selected Language ID:', this.selectedLanguageId);
    console.log('Selected Language ID type:', typeof this.selectedLanguageId);
    console.log('Available languages:', this.languages);

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

    const selectedLanguage = this.getSelectedLanguage();
    console.log('Selected language object:', selectedLanguage);

    if (!selectedLanguage) {
      console.error('Cannot find selected language');
      console.log('Looking for ID:', this.selectedLanguageId);
      console.log('In languages array:', this.languages.map(l => ({ id: l.id, name: l.name, idType: typeof l.id })));
      alert('Không tìm thấy ngôn ngữ được chọn. Vui lòng chọn lại ngôn ngữ.');
      return;
    }

    const code = this.codeEditor.getCode();
    if (!code.trim()) {
      alert('Vui lòng nhập code');
      return;
    }

    this.submitting = true;
    this.testResult = null;

    try {

      const submissionData = {
        userId: currentUser.id,
        exerciseId: this.exerciseId,
        languageId: this.selectedLanguageId,
        sourceCode: code
      };

      console.log('Creating submission:', submissionData);

      const createdSubmission = await this.apiService.createSubmission(submissionData).toPromise();
      console.log('Submission created:', createdSubmission);

      if (!createdSubmission) {
        throw new Error('Không thể tạo submission');
      }

      this.latestSubmission = createdSubmission;
      this.loadSubmissions();

      console.log('Executing code with Judge0...');
      console.log('Using language code:', selectedLanguage.code);

      const judge0Result = await this.codeExecution.submitCode(code, selectedLanguage.code).toPromise();
      console.log('Judge0 result:', judge0Result);

      const updateData = {
        stdout: judge0Result.stdout || '',
        stderr: judge0Result.stderr || '',
        compileOutput: judge0Result.compile_output || '',
        time: judge0Result.time ? parseFloat(judge0Result.time) : null,
        memory: judge0Result.memory ? parseInt(judge0Result.memory) : null,
        status: this.determineStatus(judge0Result)
      };

      console.log('Updating submission with:', updateData);

      const updatedSubmission = await this.apiService.updateSubmissionResult(createdSubmission.id!, updateData).toPromise();
      console.log('Submission updated:', updatedSubmission);

      if (updatedSubmission) {
        this.latestSubmission = updatedSubmission;

        this.compareResults(updatedSubmission);

        this.loadSubmissions();
      }

      alert('Nộp bài thành công!');

    } catch (error: any) {
      console.error('Submit error:', error);

      if (this.latestSubmission?.id) {
        const errorUpdateData = {
          status: 'ERROR',
          stderr: error.message || 'Có lỗi xảy ra khi thực thi code'
        };

        this.apiService.updateSubmissionResult(this.latestSubmission.id, errorUpdateData).subscribe({
          next: (updated) => {
            if (updated) {
              this.latestSubmission = updated;
              this.loadSubmissions();
            }
          },
          error: (updateError) => {
            console.error('Error updating submission status:', updateError);
          }
        });
      }

      if (error.error?.error) {
        alert('Lỗi: ' + error.error.error);
      } else if (error.error?.message) {
        alert('Lỗi: ' + error.error.message);
      } else {
        alert('Có lỗi xảy ra khi nộp bài: ' + error.message);
      }
    } finally {
      this.submitting = false;
    }
  }

  private determineStatus(judge0Result: any): string {
    if (judge0Result.compile_output && judge0Result.compile_output.trim()) {
      return 'ERROR';
    }

    if (judge0Result.stderr && judge0Result.stderr.trim()) {
      return 'ERROR';
    }

    if (judge0Result.stdout && judge0Result.stdout.trim()) {
      return 'SUCCESS';
    }
    return 'FAIL';
  }

  compareResults(submission: Submission) {
    if (!this.exercise) {
      this.testResult = {
        passed: false,
        actualOutput: submission.stdout || '',
        expectedOutput: 'Không có bài tập để so sánh',
        message: 'Không thể so sánh do thiếu thông tin bài tập'
      };
      return;
    }

    const actualOutput = (submission.stdout || '').trim();
    let expectedOutput = '';
    let passed = false;

    if (this.exercise.sampleOutput) {
      expectedOutput = this.exercise.sampleOutput.trim();
      passed = actualOutput === expectedOutput;
    } else {
      passed = !!actualOutput && !submission.stderr && !submission.compileOutput;
      expectedOutput = 'Không có output mẫu để so sánh';
    }

    if (submission.stderr || submission.compileOutput) {
      passed = false;
    }

    this.testResult = {
      passed: passed,
      actualOutput: actualOutput,
      expectedOutput: expectedOutput,
      message: passed
        ? 'Chính xác! Output khớp với kết quả mong đợi.'
        : 'Sai! Output không khớp với kết quả mong đợi.'
    };

    const finalStatus = passed ? 'SUCCESS' : 'FAIL';

    if (submission.status !== finalStatus && submission.id) {
      const updateData = { status: finalStatus };
      this.apiService.updateSubmissionResult(submission.id, updateData).subscribe({
        next: (updated) => {
          if (updated) {
            this.latestSubmission = updated;
            this.loadSubmissions();
          }
        },
        error: (error) => {
          console.error('Error updating final status:', error);
        }
      });
    }
  }

  viewSubmissionDetails(submission: Submission) {
    this.selectedSubmissionDetail = submission;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('submissionModal'));
    modal.show();
  }

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

  getSelectedLanguage(): Language | null {
    if (!this.selectedLanguageId || this.languages.length === 0) {
      return null;
    }

    const selectedId = Number(this.selectedLanguageId);
    const found = this.languages.find(lang => Number(lang.id) === selectedId);

    console.log('Finding language with ID:', selectedId);
    console.log('Found language:', found);

    return found || null;
  }

  getSelectedLanguageCode(): number | null {
    const selectedLang = this.getSelectedLanguage();
    return selectedLang ? selectedLang.code : null;
  }
}
