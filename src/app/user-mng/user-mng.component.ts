import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { User } from '../models/user.model';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-mng',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './user-mng.component.html',
  styleUrl: './user-mng.component.scss'
})
export class UserMngComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  loading = true;
  error = '';

  currentPage = 1;
  pageSize = 10;
  collectionSize = 0;
  pagedUsers: User[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.apiService.getUsersPaged(this.currentPage - 1, this.pageSize).subscribe({
      next: (response) => {
        this.users = response.content;
        this.filteredUsers = response.content;
        this.pagedUsers = response.content;
        this.collectionSize = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải danh sách người dùng';
        this.loading = false;
      }
    });
  }

  updatePagedUsers() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.pagedUsers = this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
  }

  searchUsers() {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.collectionSize = this.filteredUsers.length;
    this.currentPage = 1;
    this.updatePagedUsers();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }
  totalPages(): number {
    return Math.ceil(this.collectionSize / this.pageSize);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  getRoleClass(role: string): string {
    return role === 'ADMIN' ? 'bg-warning text-dark' : 'bg-info';
  }

  getRoleText(role: string): string {
    return role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng';
  }
}
