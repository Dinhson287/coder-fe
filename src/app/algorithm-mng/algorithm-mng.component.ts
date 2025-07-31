import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Exercise, ExerciseUtils } from '../models/exercise.model';
import { ApiService } from '../services/api.service';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-algorithm-mng',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPaginationModule],
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

  allExercises: Exercise[] = [];

  currentPage = 1;
  pageSize = 10;
  collectionSize = 0;



  currentTopicInput = '';
  currentTopicsList: string[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadExercises();
    this.loadTopics();
  }

  loadExercises() {
    this.loading = true;
    this.apiService.getExercises().subscribe({
      next: (allExercises) => {
        this.allExercises = allExercises;
        this.apiService.getExercisesPaged(this.currentPage - 1, this.pageSize).subscribe({
          next: (response) => {
            this.exercises = response.content;
            this.filteredExercises = response.content;
            this.collectionSize = response.totalElements;
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Không thể tải danh sách bài tập';
            this.loading = false;
          }
        });
      },
      error: (error) => {
        this.error = 'Không thể tải danh sách bài tập';
        this.loading = false;
      }
    });
  }

  onPageChange(page: number) {
  this.currentPage = page;
  const startIndex = (page - 1) * this.pageSize;
  this.filteredExercises = this.allExercises.slice(startIndex, startIndex + this.pageSize);
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
    let filtered = this.allExercises;

    if (this.searchTerm.trim()) {
      filtered = filtered.filter(ex =>
        ex.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ExerciseUtils.getTopicsList(ex).some(topic =>
          topic.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    }

    if (this.selectedTopic) {
      filtered = filtered.filter(ex =>
        ExerciseUtils.containsTopic(ex, this.selectedTopic)
      );
    }

    if (this.selectedDifficulty) {
      filtered = filtered.filter(ex =>
        ex.difficulty?.toLowerCase() === this.selectedDifficulty.toLowerCase()
      );
    }

    this.collectionSize = filtered.length;
    this.currentPage = 1;

    this.filteredExercises = filtered.slice(0, this.pageSize);
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

    this.currentExercise = {
      id: exercise.id,
      title: exercise.title,
      description: exercise.description,
      difficulty: exercise.difficulty,
      sampleInput: exercise.sampleInput,
      sampleOutput: exercise.sampleOutput,
      topics: exercise.topics || '',
      createdAt: exercise.createdAt
    };

    console.log('Copied currentExercise:', this.currentExercise);

    this.currentTopicsList = ExerciseUtils.getTopicsList(exercise);
    this.currentTopicInput = '';

    console.log('Parsed topics list:', this.currentTopicsList);
    console.log('Current exercise topics after copy:', this.currentExercise.topics);

    this.showEditModal = true;
  }

  addTopic() {
    const topic = this.currentTopicInput.trim();
    this.currentTopicsList.push(topic);
    this.currentTopicInput = '';
    this.updateTopicsString();
  }

  removeTopic(index: number) {

    this.currentTopicsList.splice(index, 1);
    this.updateTopicsString();
  }

  addExistingTopic(topic: string) {
    this.currentTopicsList.push(topic);
    this.updateTopicsString();
  }

  private updateTopicsString() {
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
    this.updateTopicsString();


    const exerciseData = {
      id: this.currentExercise.id,
      title: this.currentExercise.title,
      description: this.currentExercise.description,
      difficulty: this.currentExercise.difficulty,
      sampleInput: this.currentExercise.sampleInput,
      sampleOutput: this.currentExercise.sampleOutput,
      topics: this.currentExercise.topics,
      createdAt: this.currentExercise.createdAt
    };


    if (this.currentExercise.id) {
      this.apiService.updateExercise(this.currentExercise.id, exerciseData).subscribe({
        next: (response) => {
          this.loadExercises();
          this.loadTopics();
          this.showEditModal = false;
        },
        error: (error) => {
          console.error('Error updating exercise:', error);
          console.error('Error details:', error.error);
          alert('Không thể cập nhật bài tập: ' + (error.error?.message || error.message));
        }
      });
    } else {
      this.apiService.createExercise(exerciseData).subscribe({
        next: (response) => {
          this.loadExercises();
          this.loadTopics();
          this.showAddModal = false;
        },
        error: (error) => {
          console.error('Error creating exercise:', error);
          console.error('Error details:', error.error);
          alert('Không thể tạo bài tập mới: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  closeAddModal() {
    this.showAddModal = false;
    this.resetForm();
  }

  closeEditModal() {
    this.showEditModal = false;
    this.resetForm();
  }

  resetForm() {
    this.currentExercise = {};
    this.currentTopicsList = [];
    this.currentTopicInput = '';
  }

  deleteExercise(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa bài tập này?')) {
      this.apiService.deleteExercise(id).subscribe({
        next: () => {
          this.loadExercises();
          this.loadTopics();
        },
        error: (error) => {
          alert('Không thể xóa bài tập');
        }
      });
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
