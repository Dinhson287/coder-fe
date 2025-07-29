import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise} from '../models/exercise.model';
import { Submission } from '../models/submission.model';
import { SubmissionCreate } from '../models/submission-create.model';
import { Language } from '../models/language.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn:'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Exercise API
  getExercises(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.baseUrl}/exercises`);
  }

  getExerciseById(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.baseUrl}/exercises/${id}`);
  }

  createExercise(exercise: Partial<Exercise>): Observable<Exercise> {
    return this.http.post<Exercise>(`${this.baseUrl}/exercises`, exercise);
  }

  updateExercise(id: number, exercise: Partial<Exercise>): Observable<Exercise> {
    return this.http.put<Exercise>(`${this.baseUrl}/exercises/${id}`, exercise);
  }

  deleteExercise(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/exercises/${id}`);
  }

  // Submission API
  createSubmission(submission: SubmissionCreate): Observable<Submission> {
    return this.http.post<Submission>(`${this.baseUrl}/submissions`, submission);
  }

  getSubmissionById(id: number): Observable<Submission> {
    return this.http.get<Submission>(`${this.baseUrl}/submissions/${id}`);
  }

  getMySubmissions(): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.baseUrl}/submissions/my-submissions`);
  }

  getMySubmissionsPaged(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.baseUrl}/submissions/my-submissions/paged`, { params });
  }

  getSubmissionsByExercise(exerciseId: number): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.baseUrl}/submissions/exercise/${exerciseId}`);
  }

  getMySubmissionsForExercise(exerciseId: number): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.baseUrl}/submissions/exercise/${exerciseId}/my-submissions`);
  }

  getLatestSuccessfulSubmission(exerciseId: number): Observable<Submission> {
    return this.http.get<Submission>(`${this.baseUrl}/submissions/exercise/${exerciseId}/latest-success`);
  }

  getPendingSubmissions(): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.baseUrl}/submissions/pending`);
  }

  updateSubmissionResult(id: number, result: any): Observable<Submission> {
    return this.http.put<Submission>(`${this.baseUrl}/submissions/${id}/result`, result);
  }

  getMySubmissionStats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/submissions/stats/my-stats`);
  }

  getSubmissionStatsByLanguage(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/submissions/stats/by-language`);
  }

  deleteSubmission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/submissions/${id}`);
  }

  // Language API
  getLanguages(): Observable<Language[]> {
    return this.http.get<Language[]>(`${this.baseUrl}/languages`);
  }

  // User API
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/me`);
  }
}
