import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exercise-list.component.html',
  styleUrl: './exercise-list.component.scss'
})
export class ExerciseListComponent {
  exercises = [
    { id: 1, title: 'Hello World', description: 'In ra dòng chữ Hello World', language: 'Python' },
    { id: 2, title: 'Tính tổng', description: 'Nhập 2 số và tính tổng', language: 'C++' },
    { id: 3, title: 'Đảo ngược chuỗi', description: 'Viết chương trình đảo ngược một chuỗi', language: 'JavaScript' }
  ];

  constructor(private router: Router) {}

  viewExercise(id: number) {
    this.router.navigate(['/code'], { queryParams: { exerciseId: id } });
  }
}
