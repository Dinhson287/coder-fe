export interface SubmissionCreate {
  exerciseId: number;
  languageId: number;
  sourceCode: string;
  userId: number;
  status: 'PENDING' | 'SUCCESS' | 'FAIL' | 'ERROR';
  stdout: string;
  stderr: string;
  compileOutput: string;
  time?: number;
  createdAt: string;
}
