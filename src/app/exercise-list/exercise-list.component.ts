import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Exercise, ExerciseUtils } from '../models/exercise.model';
import { ApiService } from '../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './exercise-list.component.html',
  styleUrl: './exercise-list.component.scss'
})
export class ExerciseListComponent implements OnInit {
  exercises: Exercise[] = [];
  filteredExercises: Exercise[] = [];
  availableTopics: string[] = [];
  loading = true;
  error = '';

  // Filters
  searchTerm = '';
  selectedTopic = '';
  selectedDifficulty = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadExercises();
    this.loadTopics();

    // Check for URL parameters
    this.route.queryParams.subscribe(params => {
      if (params['topic']) {
        this.selectedTopic = params['topic'];
      }
      if (params['difficulty']) {
        this.selectedDifficulty = params['difficulty'];
      }
      this.applyFilters();
    });
  }

  loadExercises() {
    this.apiService.getExercises().subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.filteredExercises = exercises;
        this.loading = false;
        this.applyFilters();
      },
      error: (error) => {
        this.error = 'Không thể tải danh sách bài tập';
        this.loading = false;
      }
    });
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
    let filtered = this.exercises;

    if (this.searchTerm.trim()) {
      filtered = filtered.filter(ex =>
        ex.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ex.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ExerciseUtils.getTopicsList(ex).some(topic =>
          topic.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    }

    // Filter by topic
    if (this.selectedTopic) {
      filtered = filtered.filter(ex =>
        ExerciseUtils.containsTopic(ex, this.selectedTopic)
      );
    }

    // Filter by difficulty
    if (this.selectedDifficulty) {
      filtered = filtered.filter(ex => ex.difficulty === this.selectedDifficulty);
    }

    this.filteredExercises = filtered;
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedTopic = '';
    this.selectedDifficulty = '';
    this.applyFilters();

    // Update URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      // queryParamsHandling: 'replace'
    });
  }

  filterByTopic(topic: string) {
    this.selectedTopic = topic;
    this.applyFilters();

    // Update URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { topic: topic },
      queryParamsHandling: 'merge'
    });
  }

  viewExercise(id: number) {
    this.router.navigate(['/code'], { queryParams: { exerciseId: id } });
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

  getTopicsList(exercise: Exercise): string[] {
    return ExerciseUtils.getTopicsList(exercise);
  }

  formatTopics(exercise: Exercise): string {
    return ExerciseUtils.formatTopicsDisplay(exercise);
  }
}
