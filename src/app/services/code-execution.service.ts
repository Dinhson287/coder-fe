import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CodeExecutionService {
  apiUrl = 'https://judge0-ce.p.rapidapi.com/submissions';
  headers = new HttpHeaders({
    'content-type': 'application/json',
    'X-RapidAPI-Key': 'ba3a9f30bfmsh0b9806837c15082p18c27djsn4aca2da5d9a4',
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
