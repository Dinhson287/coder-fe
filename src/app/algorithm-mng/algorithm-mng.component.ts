import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Exercise, ExerciseUtils } from '../models/exercise.model';
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
  selectedTopic = '';
  selectedDifficulty = '';
  availableTopics: string[] = [];
  loading = true;
  error = '';
  showAddModal = false;
  showEditModal = false;
  currentExercise: Partial<Exercise> = {};

  // For topics management
  currentTopicInput = '';
  currentTopicsList: string[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadExercises();
    this.loadTopics();
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

  searchExercises() {
    let filtered = this.exercises;

    // Filter by search term
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(ex =>
        ex.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
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
    this.filteredExercises = this.exercises;
  }

  openAddModal() {
    this.currentExercise = {
      title: '',
      description: '',
      difficulty: 'EASY',
      sampleInput: '',
      sampleOutput: '',
      topics: ''
    };
    this.currentTopicsList = [];
    this.currentTopicInput = '';
    this.showAddModal = true;
  }

  openEditModal(exercise: Exercise) {
    this.currentExercise = { ...exercise };
    this.currentTopicsList = ExerciseUtils.getTopicsList(exercise);
    this.currentTopicInput = '';

    console.log('Opening edit modal for exercise:', exercise); // Debug log
    console.log('Topics list:', this.currentTopicsList); // Debug log
    console.log('Current exercise topics:', this.currentExercise.topics); // Debug log

    this.showEditModal = true;
  }

  addTopic() {
    const topic = this.currentTopicInput.trim();
    if (topic && !this.currentTopicsList.includes(topic)) {
      this.currentTopicsList.push(topic);
      this.currentTopicInput = '';
      this.updateTopicsString();
    }
  }

  removeTopic(index: number) {
    this.currentTopicsList.splice(index, 1);
    this.updateTopicsString();
  }

  addExistingTopic(topic: string) {
    if (!this.currentTopicsList.includes(topic)) {
      this.currentTopicsList.push(topic);
      this.updateTopicsString();
    }
  }

  private updateTopicsString() {
    // Cập nhật trực tiếp vào currentExercise.topics
    if (this.currentTopicsList.length === 0) {
      this.currentExercise.topics = '';
    } else {
      this.currentExercise.topics = this.currentTopicsList
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0)
        .join(', ');
    }
  }

  saveExercise() {
    // Đảm bảo topics được cập nhật trước khi lưu
    this.updateTopicsString();

    console.log('Saving exercise with topics:', this.currentExercise.topics); // Debug log

    if (this.currentExercise.id) {
      this.apiService.updateExercise(this.currentExercise.id, this.currentExercise).subscribe({
        next: (response) => {
          console.log('Exercise updated successfully:', response); // Debug log
          this.loadExercises();
          this.loadTopics(); // Reload topics in case new ones were added
          this.showEditModal = false;
        },
        error: (error) => {
          console.error('Error updating exercise:', error); // Debug log
          alert('Không thể cập nhật bài tập: ' + (error.error?.message || error.message));
        }
      });
    } else {
      this.apiService.createExercise(this.currentExercise).subscribe({
        next: (response) => {
          console.log('Exercise created successfully:', response); // Debug log
          this.loadExercises();
          this.loadTopics(); // Reload topics in case new ones were added
          this.showAddModal = false;
        },
        error: (error) => {
          console.error('Error creating exercise:', error); // Debug log
          alert('Không thể tạo bài tập mới: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  deleteExercise(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa bài tập này?')) {
      this.apiService.deleteExercise(id).subscribe({
        next: () => {
          this.loadExercises();
          this.loadTopics(); // Reload topics as the available topics might change
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

  formatTopics(exercise: Exercise): string {
    return ExerciseUtils.formatTopicsDisplay(exercise);
  }

  getTopicsList(exercise: Exercise): string[] {
    return ExerciseUtils.getTopicsList(exercise);
  }
}
