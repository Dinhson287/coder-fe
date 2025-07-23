import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-algorithm-mng',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './algorithm-mng.component.html',
  styleUrl: './algorithm-mng.component.scss'
})
export class AlgorithmMngComponent {
  problems = [
  { id: 1, title: 'Tính tổng dãy số', level: 'Easy', submissions: 123, status: 'Active' },
  { id: 2, title: 'Duyệt cây nhị phân', level: 'Medium', submissions: 95, status: 'Active' },
  { id: 3, title: 'Quy hoạch động bài toán ba lô', level: 'Hard', submissions: 45, status: 'Hidden' },
];

}
