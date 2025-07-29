import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Exercise } from '../models/exercise.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  problems: Exercise[] = [];
  topCoders = [
    { name: 'Hoàng Thu Phương', points: 2300 },
    { name: 'Dinh Phuc Son', points: 1900 },
    { name: 'Nguyễn Minh Huy', points: 1700 },
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadFeaturedProblems();
  }

  loadFeaturedProblems() {
    this.apiService.getExercises().subscribe({
      next: (exercises) => {
        // Take first 3 exercises as featured
        this.problems = exercises.slice(0, 3);
      },
      error: (error) => {
        console.error('Error loading exercises:', error);
        // Fallback to static data
        this.problems = [
          { id: 1, title: 'Tính tổng dãy số', difficulty: 'EASY' } as Exercise,
          { id: 2, title: 'Duyệt đồ thị BFS', difficulty: 'MEDIUM' } as Exercise,
          { id: 3, title: 'Quy hoạch động bài toán ba lô', difficulty: 'HARD' } as Exercise,
        ];
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
}
