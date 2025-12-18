import { Course } from './course';
export interface EnrollmentResponseDTO {
  id: number;
  enrollmentDate: string;
  overallProgress: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  course: Course;
  completedLessons: any[];

}
export interface EnrollmentRequestDTO {
  studentId: number;
  courseId: number;
}

