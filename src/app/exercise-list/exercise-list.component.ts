import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Exercise, ExerciseUtils } from '../models/exercise.model';
import { ApiService } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgbPaginationModule],
  templateUrl: './exercise-list.component.html',
  styleUrl: './exercise-list.component.scss'
})
export class ExerciseListComponent implements OnInit {
  exercises: Exercise[] = [];
  filteredExercises: Exercise[] = [];
  availableTopics: string[] = [];
  loading = true;
  error = '';

  currentPage = 1;
  pageSize = 10;
  collectionSize = 0;
  pagedExercises: Exercise[] = [];

  searchTerm = '';
  selectedTopic = '';
  selectedDifficulty = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadExercises();
    this.loadTopics();


    this.route.queryParams.subscribe(params => {
      if (params['topic']) {
        this.selectedTopic = params['topic'];
      }
      if (params['difficulty']) {
        this.selectedDifficulty = params['difficulty'];
      }

      if (this.exercises.length > 0) {
        this.applyFilters();
      }
    });
  }

  loadExercises() {
    this.apiService.getExercises().subscribe({
      next: (exercises) => {
        this.exercises = this.sortExercises(exercises);
        this.collectionSize = exercises.length;
        this.loading = false;
        this.applyFilters();
        this.updatePagedExercises();
      },
      error: (error) => {
        this.error = 'Không thể tải danh sách bài tập';
        this.loading = false;
        console.error('Error loading exercises:', error);
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePagedExercises();
  }

  updatePagedExercises() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedExercises = this.filteredExercises.slice(startIndex, endIndex);

    this.changeDetectorRef.detectChanges();
  }

  loadTopics() {
    this.apiService.getAllTopics().subscribe({
      next: (topics) => {
        this.availableTopics = topics;
      },
      error: (error) => {
        console.error('Error loading topics:', error);
      }
    });
  }

applyFilters() {
  let filtered = [...this.exercises];

  if (this.searchTerm && this.searchTerm.trim()) {
    const searchLower = this.searchTerm.toLowerCase().trim();
    filtered = filtered.filter(ex => {
      //ID
      const idMatch = ex.id?.toString().includes(this.searchTerm.trim());
      //tên
      const titleMatch = ex.title?.toLowerCase().includes(searchLower);
      //mô tả
      const descMatch = ex.description?.toLowerCase().includes(searchLower);
      //chủ đề
      const topicMatch = ExerciseUtils.getTopicsList(ex).some(topic =>
        topic.toLowerCase().includes(searchLower)
      );
      return idMatch || titleMatch || descMatch || topicMatch;
    });
  }

  if (this.selectedTopic && this.selectedTopic.trim()) {
    filtered = filtered.filter(ex =>
      ExerciseUtils.containsTopic(ex, this.selectedTopic)
    );
  }

  if (this.selectedDifficulty && this.selectedDifficulty.trim()) {
    filtered = filtered.filter(ex =>
      ex.difficulty?.toLowerCase() === this.selectedDifficulty.toLowerCase()
    );
  }

  filtered = this.sortExercises(filtered);

  this.filteredExercises = filtered;
  this.collectionSize = filtered.length;
  this.currentPage = 1;
  this.updatePagedExercises();
}

  sortExercises(exercises: Exercise[]): Exercise[] {
    const difficultyOrder: Record<string, number> = {
      'easy': 1,
      'medium': 2,
      'hard': 3
    };

    return exercises.sort((a, b) => {
      const aDifficulty = a.difficulty?.toLowerCase() || '';
      const bDifficulty = b.difficulty?.toLowerCase() || '';

      if (difficultyOrder[aDifficulty] < difficultyOrder[bDifficulty]) return -1;
      if (difficultyOrder[aDifficulty] > difficultyOrder[bDifficulty]) return 1;

      const aTitle = a.title?.toLowerCase() || '';
      const bTitle = b.title?.toLowerCase() || '';
      return aTitle.localeCompare(bTitle);
    });
  }

  totalPages(): number {
    return Math.ceil(this.collectionSize / this.pageSize);
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedTopic = '';
    this.selectedDifficulty = '';
    this.applyFilters();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  filterByTopic(topic: string) {
    if (this.selectedTopic === topic) {
      this.selectedTopic = '';
    } else {
      this.selectedTopic = topic;
    }
    this.applyFilters();

    const queryParams = this.selectedTopic ? { topic: this.selectedTopic } : {};
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      replaceUrl: true
    });
  }

  onDifficultyChange() {
    this.applyFilters();
    const queryParams: any = {};
    if (this.selectedTopic) queryParams.topic = this.selectedTopic;
    if (this.selectedDifficulty) queryParams.difficulty = this.selectedDifficulty;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  viewExercise(id: number) {
    if (!this.authService.isLoggedIn()) {
      const confirm = window.confirm('Bạn cần đăng nhập để nộp bài. Bấm OK để chuyển đến trang đăng nhập.');
      if (confirm) {
        this.router.navigate(['/login']);
      }
      return;
    } else {
      this.router.navigate(['/code'], { queryParams: { exerciseId: id } });
    }
  }

  getDifficultyClass(difficulty: string): string {
    const diff = difficulty?.toLowerCase();
    switch (diff) {
      case 'easy': return 'bg-success';
      case 'medium': return 'bg-warning text-dark';
      case 'hard': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getDifficultyText(difficulty: string): string {
    const diff = difficulty?.toLowerCase();
    switch (diff) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return difficulty;
    }
  }

  getTopicsList(exercise: Exercise): string[] {
    return ExerciseUtils.getTopicsList(exercise);
  }

  formatTopics(exercise: Exercise): string {
    return ExerciseUtils.formatTopicsDisplay(exercise);
  }
}
