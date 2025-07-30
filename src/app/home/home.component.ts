import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Exercise, ExerciseUtils } from '../models/exercise.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  problems: Exercise[] = [];
  availableTopics: string[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadFeaturedProblems();
    this.loadTopics();
  }

  loadFeaturedProblems() {
    this.apiService.getExercises().subscribe({
      next: (exercises) => {
        this.problems = exercises.slice(0, 3);
      },
      error: (error) => {
        console.error('Error loading exercises:', error);
      }
    });
  }

  loadTopics() {
    this.apiService.getAllTopics().subscribe({
      next: (topics) => {
        this.availableTopics = topics.slice(0, 8);
      },
      error: (error) => {
        console.error('Error loading topics:', error);
        this.availableTopics = [
          'Sorting', 'Graph', 'Dynamic Programming', 'String',
          'Number Theory', 'Greedy', 'Tree', 'Array'
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

  getTopicsList(exercise: Exercise): string[] {
    return ExerciseUtils.getTopicsList(exercise);
  }

  formatTopics(exercise: Exercise): string {
    return ExerciseUtils.formatTopicsDisplay(exercise);
  }
}
