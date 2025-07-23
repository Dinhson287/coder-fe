import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AlgorithmMngComponent } from './algorithm-mng/algorithm-mng.component';
import { UserMngComponent } from './user-mng/user-mng.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { ExerciseListComponent } from './exercise-list/exercise-list.component';

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
    component: ProfileComponent
  },
  {
    path: 'algorithm-mng',
    component: AlgorithmMngComponent
  },
  {
    path: 'user-mng',
    component: UserMngComponent
  },
  {
    path: 'code',
    component: CodeEditorComponent
  },
  {
    path: 'exercises',
    component: ExerciseListComponent
  },


];
