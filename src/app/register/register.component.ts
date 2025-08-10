import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  userData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.error = '';

    if (!this.userData.username || !this.userData.email || !this.userData.password) {
      this.error = 'Vui lòng nhập đầy đủ thông tin';
      return;
    }

    if (this.userData.password !== this.userData.confirmPassword) {
      this.error = 'Mật khẩu xác nhận không khớp';
      return;
    }

    if (this.userData.password.length < 6) {
      this.error = 'Mật khẩu phải có ít nhất 6 ký tự';
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(this.userData.username)) {
      this.error = 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới';
      return;
    }

    if (this.userData.username.length < 3 || this.userData.username.length > 50) {
      this.error = 'Tên người dùng phải từ 3-50 ký tự';
      return;
    }

    const emailRegex = /^[A-Za-z0-9+_.-]+@(.+)$/;
    if (!emailRegex.test(this.userData.email)) {
      this.error = 'Định dạng email không hợp lệ';
      return;
    }

    this.loading = true;

    this.authService.register(this.userData).subscribe({
      next: (response) => {
        console.log('Đăng ký thành công:', response);
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Lỗi đăng ký:', error);

        this.loading = false;

        if (error.status === 409 || error.status === 400) {
          this.error = error.error?.message || 'Username hoặc email đã tồn tại';
        } else if (error.status === 0) {
          this.error = 'Không thể kết nối đến server. Vui lòng thử lại.';
        } else if (error.status >= 500) {
          this.error = 'Lỗi server. Vui lòng thử lại sau.';
        } else {
          this.error = error.error?.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.';
        }
      }
    });
  }
}
