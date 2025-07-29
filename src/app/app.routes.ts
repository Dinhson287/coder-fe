import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AlgorithmMngComponent } from './algorithm-mng/algorithm-mng.component';
import { UserMngComponent } from './user-mng/user-mng.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { ExerciseListComponent } from './exercise-list/exercise-list.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/auth.guard';
import { MySubmissionsComponent } from './my-submissions/my-submissions.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'algorithm-mng',
    component: AlgorithmMngComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'user-mng',
    component: UserMngComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'code',
    component: CodeEditorComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'exercises',
    component: ExerciseListComponent
  },
  {
    path: 'my-submissions',
    component: MySubmissionsComponent,
    canActivate: [AuthGuard]
  }
];
