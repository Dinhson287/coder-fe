import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  problems = [
    { id: 1, title: 'Tính tổng dãy số', level: 'Easy' },
    { id: 2, title: 'Duyệt đồ thị BFS', level: 'Medium' },
    { id: 3, title: 'Quy hoạch động bài toán ba lô', level: 'Hard' },
  ];

  topCoders = [
    { name: 'Hoàng Thu Phương', points: 2300 },
    { name: 'Dinh Phuc Son', points: 1900 },
    { name: 'Nguyễn Minh Huy', points: 1700 },
  ];

}
