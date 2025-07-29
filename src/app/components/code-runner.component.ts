import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MonacoCodeEditorComponent } from './monaco-code-editor.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import {Submission } from '../models/submission.model';
import { Exercise } from '../models/exercise.model';
import { Language } from '../models/language.model';

@Component({
  selector: 'app-code-runner',
  standalone: true,
  imports: [MonacoCodeEditorComponent, CommonModule, FormsModule],
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
              <select class="form-select w-auto" [(ngModel)]="selectedLanguageId">
                <option *ngFor="let lang of languages" [value]="lang.id">
                  {{ lang.name }}
                </option>
              </select>
            </div>
            <div class="card-body p-0">
              <app-monaco-code-editor #codeEditor></app-monaco-code-editor>
            </div>
            <div class="card-footer">
              <button
                class="btn btn-primary"
                (click)="submitCode()"
                [disabled]="submitting">
                <span *ngIf="submitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ submitting ? 'Đang chạy...' : 'Submit' }}
              </button>
            </div>
          </div>
        </div>
      </div>

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
              <div *ngIf="latestSubmission.stdout">
                <h6>Output:</h6>
                <pre class="bg-light p-2">{{ latestSubmission.stdout }}</pre>
              </div>
              <div *ngIf="latestSubmission.stderr">
                <h6>Error:</h6>
                <pre class="bg-danger text-white p-2">{{ latestSubmission.stderr }}</pre>
              </div>
              <div *ngIf="latestSubmission.compileOutput">
                <h6>Compile Output:</h6>
                <pre class="bg-warning p-2">{{ latestSubmission.compileOutput }}</pre>
              </div>
              <div class="row mt-2" *ngIf="latestSubmission.time || latestSubmission.memory">
                <div class="col-md-6" *ngIf="latestSubmission.time">
                  <small>Thời gian: {{ latestSubmission.time }}s</small>
                </div>
                <div class="col-md-6" *ngIf="latestSubmission.memory">
                  <small>Bộ nhớ: {{ latestSubmission.memory }}KB</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-3">
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
                      <th>Thời gian thực thi</th>
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
    </div>
  `
})
export class CodeRunnerComponent implements OnInit {
  @ViewChild('codeEditor') codeEditor!: MonacoCodeEditorComponent;

  exercise: Exercise | null = null;
  languages: Language[] = [];
  submissions: Submission[] = [];
  latestSubmission: Submission | null = null;
  selectedLanguageId = 71; // Python default
  submitting = false;
  exerciseId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService
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
    if (this.exerciseId) {
      this.apiService.getMySubmissionsForExercise(this.exerciseId).subscribe({
        next: (submissions) => {
          this.submissions = submissions;
        },
        error: (error) => {
          console.error('Error loading submissions:', error);
        }
      });
    }
  }

  submitCode() {
    if (!this.exerciseId) return;

    // Kiểm tra authentication trước khi submit
    if (!this.authService.isLoggedIn()) {
      alert('Bạn cần đăng nhập để nộp bài');
      return;
    }

    const code = this.codeEditor.getCode();
    if (!code.trim()) {
      alert('Vui lòng nhập code');
      return;
    }

    this.submitting = true;

    const submission = {
      exerciseId: this.exerciseId,
      languageId: this.selectedLanguageId,
      sourceCode: code
    };

    this.apiService.createSubmission(submission).subscribe({
      next: (result) => {
        this.latestSubmission = result;
        this.loadSubmissions();
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error submitting code:', error);
        this.submitting = false;

        if (error.status === 401) {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
          alert('Có lỗi xảy ra khi nộp bài: ' + (error.error?.message || error.message));
        }
      }
    });
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
}
