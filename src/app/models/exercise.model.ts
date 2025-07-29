export interface Exercise {
  id: number;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  sampleInput: string;
  sampleOutput: string;
  createdAt: string;
}
