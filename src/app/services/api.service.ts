import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from '../models/exercise.model';
import { Submission } from '../models/submission.model';
import { SubmissionCreate } from '../models/submission-create.model';
import { Language } from '../models/language.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Exercise APIs
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

  getExercisesPaged(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString());
    return this.http.get<any>(`${this.baseUrl}/exercises/paged`, { params });
}

  // Topics APIs
  getExercisesByTopic(topic: string): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.baseUrl}/exercises/topic/${encodeURIComponent(topic)}`);
  }

  getExercisesByTopicAndDifficulty(topic: string, difficulty: string): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.baseUrl}/exercises/topic/${encodeURIComponent(topic)}/difficulty/${difficulty}`);
  }

  getAllTopics(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/exercises/topics`);
  }

  searchExercises(keyword: string): Observable<Exercise[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<Exercise[]>(`${this.baseUrl}/exercises/search/all`, { params });
  }

  // Submission APIs
createSubmission(submissionData: any): Observable<Submission> {
    return this.http.post<Submission>(`${this.baseUrl}/submissions`, submissionData);
  }

  saveSubmissionResult(submissionData: {
    exerciseId: number;
    languageId: number;
    sourceCode: string;
    userId: number;
    status: string;
    stdout?: string;
    stderr?: string;
    compileOutput?: string;
    time?: number;
    memory?: number;
  }): Observable<Submission> {
    return this.http.post<Submission>(`${this.baseUrl}/submissions/save-result`, submissionData);
  }

  getSubmissionById(id: number): Observable<Submission> {
    return this.http.get<Submission>(`${this.baseUrl}/submissions/${id}`);
  }

  getMySubmissions(userId: number): Observable<Submission[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<Submission[]>(`${this.baseUrl}/submissions/my-submissions`, { params });
  }

  getMySubmissionsPaged(userId: number, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.baseUrl}/submissions/my-submissions/paged`, { params });
  }

  getSubmissionsByExercise(exerciseId: number): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.baseUrl}/submissions/exercise/${exerciseId}`);
  }

  getMySubmissionsForExercise(userId: number, exerciseId: number): Observable<Submission[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<Submission[]>(`${this.baseUrl}/submissions/exercise/${exerciseId}/my-submissions`, { params });
  }

  getLatestSuccessfulSubmission(userId: number, exerciseId: number): Observable<Submission> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<Submission>(`${this.baseUrl}/submissions/exercise/${exerciseId}/latest-success`, { params });
  }

  getPendingSubmissions(): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.baseUrl}/submissions/pending`);
  }

  updateSubmissionResult(id: number, result: any): Observable<Submission> {
    return this.http.put<Submission>(`${this.baseUrl}/submissions/${id}/result`, result);
  }

  getMySubmissionStats(userId: number): Observable<any[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<any[]>(`${this.baseUrl}/submissions/stats/my-stats`, { params });
  }

  getSubmissionStatsByLanguage(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/submissions/stats/by-language`);
  }

  deleteSubmission(id: number, userId: number): Observable<void> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.delete<void>(`${this.baseUrl}/submissions/${id}`, { params });
  }

  // Language API
  getLanguages(): Observable<Language[]> {
    return this.http.get<Language[]>(`${this.baseUrl}/languages`);
  }

  // User API
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/user`);
  }

  getCurrentUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/user/profile`);
  }

  getUsersPaged(page: number = 0, size: number = 10): Observable<any> {
  const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
  return this.http.get<any>(`${this.baseUrl}/user/paged`, { params });
}
}
