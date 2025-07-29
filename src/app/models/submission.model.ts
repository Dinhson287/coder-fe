export interface Submission {
  id: number;
  userId: number;
  username: string;
  exerciseId: number;
  exerciseTitle: string;
  languageId: number;
  languageName: string;
  sourceCode: string;
  status: 'PENDING' | 'SUCCESS' | 'FAIL' | 'ERROR';
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  time?: number;
  memory?: number;
  createdAt: string;
}
