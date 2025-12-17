export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  completed: boolean;
}
