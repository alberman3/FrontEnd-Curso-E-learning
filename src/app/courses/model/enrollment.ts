export interface EnrollmentResponseDTO {
  id: number;
  enrollmentDate: string;
  overallProgress: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
}
export interface EnrollmentRequestDTO {
  studentId: number;
  courseId: number;
}
