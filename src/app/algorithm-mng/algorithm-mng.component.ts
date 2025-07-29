import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Exercise } from '../models/exercise.model';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-algorithm-mng',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './algorithm-mng.component.html',
  styleUrl: './algorithm-mng.component.scss'
})
export class AlgorithmMngComponent implements OnInit {
  exercises: Exercise[] = [];
  filteredExercises: Exercise[] = [];
  searchTerm = '';
  loading = true;
  error = '';
  showAddModal = false;
  showEditModal = false;
  currentExercise: Partial<Exercise> = {};

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadExercises();
  }

  loadExercises() {
    this.apiService.getExercises().subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.filteredExercises = exercises;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải danh sách bài tập';
        this.loading = false;
      }
    });
  }

  searchExercises() {
    if (!this.searchTerm.trim()) {
      this.filteredExercises = this.exercises;
    } else {
      this.filteredExercises = this.exercises.filter(ex =>
        ex.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  openAddModal() {
    this.currentExercise = {
      title: '',
      description: '',
      difficulty: 'EASY',
      sampleInput: '',
      sampleOutput: ''
    };
    this.showAddModal = true;
  }

  openEditModal(exercise: Exercise) {
    this.currentExercise = { ...exercise };
    this.showEditModal = true;
  }

  saveExercise() {
    if (this.currentExercise.id) {
      this.apiService.updateExercise(this.currentExercise.id, this.currentExercise).subscribe({
        next: () => {
          this.loadExercises();
          this.showEditModal = false;
        },
        error: (error) => {
          alert('Không thể cập nhật bài tập');
        }
      });
    } else {
      this.apiService.createExercise(this.currentExercise).subscribe({
        next: () => {
          this.loadExercises();
          this.showAddModal = false;
        },
        error: (error) => {
          alert('Không thể tạo bài tập mới');
        }
      });
    }
  }

  deleteExercise(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa bài tập này?')) {
      this.apiService.deleteExercise(id).subscribe({
        next: () => {
          this.loadExercises();
        },
        error: (error) => {
          alert('Không thể xóa bài tập');
        }
      });
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('vi-VN');
  }
}
