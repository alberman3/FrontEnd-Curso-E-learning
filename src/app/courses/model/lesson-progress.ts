export interface LessonProgress {
  id: number;
  enrollmentId: number;
  lessonId: number;
  completed: boolean;
  completedAt?: string;
}
