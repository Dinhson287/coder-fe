export interface Exercise {
  id: number;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  sampleInput: string;
  sampleOutput: string;
  topics: string;
  createdAt: string;
}

export class ExerciseUtils {
  static getTopicsList(exercise: Exercise): string[] {
    if (!exercise.topics || exercise.topics.trim() === '') {
      return [];
    }
    return exercise.topics.split(',')
      .map(topic => topic.trim())
      .filter(topic => topic.length > 0);
  }

  static setTopicsList(exercise: Exercise, topics: string[]): void {
    if (!topics || topics.length === 0) {
      exercise.topics = '';
    } else {
      exercise.topics = topics
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0)
        .join(', ');
    }
  }

  static hasTopics(exercise: Exercise): boolean {
    return exercise.topics !== null && exercise.topics !== undefined && exercise.topics.trim() !== '';
  }

  static containsTopic(exercise: Exercise, topic: string): boolean {
    return this.getTopicsList(exercise)
      .some(t => t.toLowerCase() === topic.toLowerCase());
  }

  static formatTopicsDisplay(exercise: Exercise): string {
    const topics = this.getTopicsList(exercise);
    if (topics.length === 0) return 'Chưa phân loại';
    if (topics.length <= 3) return topics.join(', ');
    return topics.slice(0, 3).join(', ') + ` (+${topics.length - 3})`;
  }
}
