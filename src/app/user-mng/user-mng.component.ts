import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-user-mng',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-mng.component.html',
  styleUrl: './user-mng.component.scss'
})
export class UserMngComponent {
  users = [
  { id: 1, fullname: 'Trần Văn A', birthday: '20/07/2002', submissions: 123 },
  { id: 2, fullname: 'Alexander B', birthday: '05/01/1997', submissions: 95},
  { id: 3, fullname: 'Yamato C', birthday: '21/7/1966', submissions: 45},
];

}
