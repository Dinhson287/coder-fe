import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Exercise } from '../models/exercise.model';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exercise-list.component.html',
  styleUrl: './exercise-list.component.scss'
})
export class ExerciseListComponent {
  exercises: Exercise[] = [];
  loading = true;
  error = '';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadExercises();
  }

  loadExercises() {
    this.apiService.getExercises().subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải danh sách bài tập';
        this.loading = false;
      }
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
}
