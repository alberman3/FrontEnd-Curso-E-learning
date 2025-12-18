import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../model/course';
import { Modulo } from '../model/modulo';
import { Aula } from '../model/aula';
import { LessonProgress } from '../model/lesson-progress';
import { EnrollmentResponseDTO } from '../model/enrollment';
import { map } from 'rxjs/operators';

export interface CreateCourseRequest {
  title: string;
  description: string;
  workload: number;
  imageUrl?: string;
  price?: number;
  oldPrice?: number;
  categoryIds: number[];
  instructorIds: number[];
}

export interface CreateModuleRequest {
  title: string;
  description: string;
  moduleOrder: number;
  courseId: number;

}

export interface CreateLessonRequest {
  title: string;
  content: string;
  videoUrl?: string;
  lessonOrder: number;
  moduleId: number;
}

export interface StudentCourse {
  course: Course;
  progress: number;
  completed: boolean;
}

export interface CompletedLessonResponse {
  id: number;
  lesson: Aula;
  completionDate: string;
  overallProgress: number;
}

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private readonly API_BASE = '/courses';
  constructor(private http: HttpClient) {}

  // ========== CURSOS ==========
  list(): Observable<Course[]> {
    return this.http.get<Course[]>(this.API_BASE);
  }

  getById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.API_BASE}/${id}`);
  }

  create(course: CreateCourseRequest): Observable<Course> {
    return this.http.post<Course>(this.API_BASE, course);
  }

  update(id: number, course: CreateCourseRequest): Observable<Course> {
  return this.http.put<Course>(`${this.API_BASE}/${id}`, course);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/${id}`);
  }

  getInstructorCourses(instructorId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`/instructors/${instructorId}/my-courses`);
  }

 getStudentCourses(studentId: number) {
  return this.http
    .get<EnrollmentResponseDTO[]>(`/enrollments/student/${studentId}`)
    .pipe(
      map(enrollments =>
        enrollments.map(e => ({
          // 🔥 CLONE DO COURSE (resolve o bug do id fixo)
          course: { ...e.course },

          progress: Math.round(e.overallProgress * 100),
          completed: e.status === 'COMPLETED'
        }))
      )
    );
}

  // ========== MÓDULOS ==========
 getModulesByCourse(courseId: number): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(`${this.API_BASE}/${courseId}/modules`);
  }
createModule(courseId: number, payload: CreateModuleRequest): Observable<Modulo> {
    return this.http.post<Modulo>(
      `${this.API_BASE}/${courseId}/modules`,
      payload
    );
  }


  /***
   * talvez tenha que trocar pra isso
   * createModule(courseId: number, module: CreateModuleRequest): Observable<Modulo> {
  return this.http.post<Modulo>(
    `${this.API_BASE}/${courseId}/modules`,
    module
  );
}
   */

  updateModule(courseId: number, moduleId: number, module: CreateModuleRequest): Observable<Modulo> {
    return this.http.put<Modulo>(
      `${this.API_BASE}/${courseId}/modules/${moduleId}`,
      module
    );
  }

  deleteModule(courseId: number, moduleId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_BASE}/${courseId}/modules/${moduleId}`
    );
  }

  // ========== AULAS ==========
 getLessonsByModule(courseId: number, moduleId: number): Observable<Aula[]> {
    return this.http.get<Aula[]>(
      `${this.API_BASE}/${courseId}/modules/${moduleId}/lessons`
    );
  }



 createLesson(
    courseId: number,
    moduleId: number,
    payload: CreateLessonRequest
  ): Observable<Aula> {
    return this.http.post<Aula>(
      `${this.API_BASE}/${courseId}/modules/${moduleId}/lessons`,
      payload
    );
  }

  updateLesson(
    courseId: number,
    moduleId: number,
    lessonId: number,
    lesson: CreateLessonRequest
  ): Observable<Aula> {
    return this.http.put<Aula>(
      `${this.API_BASE}/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
      lesson
    );
  }

deleteLesson(
    courseId: number,
    moduleId: number,
    lessonId: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.API_BASE}/${courseId}/modules/${moduleId}/lessons/${lessonId}`
    );
  }

  // ========== MATRÍCULA ==========
enroll(courseId: number, studentId: number): Observable<EnrollmentResponseDTO> {
    return this.http.post<EnrollmentResponseDTO>(
      '/enrollments',
      { courseId, studentId }
    );
  }

getEnrollment(courseId: number, userId: number): Observable<EnrollmentResponseDTO | null> {
    return this.http.get<EnrollmentResponseDTO[]>(`/enrollments/student/${userId}`)
      .pipe(
        map(enrollments => enrollments.find(e => e.course.id === courseId) || null)
      );
  }


  // ========== PROGRESSO ==========
  markLessonComplete(
    courseId: number,
    moduleId: number,
    lessonId: number
  ): Observable<CompletedLessonResponse> {
    return this.http.post<CompletedLessonResponse>(
      `${this.API_BASE}/${courseId}/modules/${moduleId}/lessons/${lessonId}/completed`,
      {}
    );
  }

  getEnrollmentProgress(enrollmentId: number): Observable<CompletedLessonResponse[]> {
    return this.http.get<CompletedLessonResponse[]>(
      `/enrollments/${enrollmentId}/progress`
    );
  }

  getLessonProgress(enrollmentId: number): Observable<LessonProgress[]> {
    return this.http.get<LessonProgress[]>(
      `${this.API_BASE}/progress/${enrollmentId}`
    );
  }

  getCourseProgress(courseId: number, userId: number): Observable<{
    progress: number;
    completedLessons: number;
    totalLessons: number;
  }> {
    return this.http.get<any>(
      `${this.API_BASE}/${courseId}/progress`
    );
  }

  // ========== CERTIFICADO ==========

  downloadCertificate(enrollmentId: number): Observable<Blob> {
    return this.http.get(
      `/enrollments/${enrollmentId}/certificate`,
      {
        responseType: 'blob',
        observe: 'body'
      }
    );
  }

  canIssueCertificate(enrollment: EnrollmentResponseDTO): boolean {
    return enrollment.overallProgress >= 1.0 && enrollment.status === 'COMPLETED';
  }

  // ========== CATEGORIAS ==========
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>('/categories');
  }

  // ========== INSTRUTORES ==========
  getInstructors(): Observable<any[]> {
    return this.http.get<any[]>('/instructors');
  }
}
