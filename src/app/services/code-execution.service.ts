import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CodeExecutionService {
  apiUrl = 'https://judge0-ce.p.rapidapi.com/submissions';
  headers = new HttpHeaders({
    'content-type': 'application/json',
    'X-RapidAPI-Key': '091f3f2760msh21de91828af1060p126631jsn0d40bd5c8c6b',
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
  });

  constructor(private http: HttpClient) {}

  submitCode(sourceCode: string, languageId: number) {
    const body = {
      source_code: sourceCode,
      language_id: languageId,
      stdin: ''
    };
    return this.http.post<any>(this.apiUrl + '?base64_encoded=false&wait=true', body, { headers: this.headers });
  }
}
