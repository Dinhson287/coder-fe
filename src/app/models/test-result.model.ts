export interface TestResult {
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  message: string;
}
