import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../model/course';
import { Modulo } from '../model/modulo';
import { Aula } from '../model/aula';
import { LessonProgress } from '../model/lesson-progress';
import { EnrollmentResponseDTO } from '../model/enrollment';


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
  order: number;
  courseId: number;

}

export interface CreateLessonRequest {
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  moduleId: number;
}

export interface StudentCourse {
  course: Course;
  progress: number;
  enrolledAt: string;
  completed: boolean;
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
    return this.http.post<Course>(`${this.API_BASE}/create`, course);
  }

  update(id: number, course: CreateCourseRequest): Observable<Course> {
    return this.http.put<Course>(`${this.API_BASE}/update/${id}`, course);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/delete/${id}`);
  }

  getInstructorCourses(instructorId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.API_BASE}/instructor/${instructorId}`);
  }

  getStudentCourses(studentId: number): Observable<StudentCourse[]> {
    return this.http.get<StudentCourse[]>(`${this.API_BASE}/student/${studentId}`);
  }

  // ========== MÓDULOS ==========
 getModulesByCourse(courseId: number) {
  return this.http.get<Modulo[]>(
    `/courses/${courseId}/modules`
  );
}
createModule(courseId: number, payload: CreateModuleRequest) {
  return this.http.post(
    `/courses/${courseId}/modules/create`,
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

  updateModule(id: number, module: CreateModuleRequest): Observable<Modulo> {
    return this.http.put<Modulo>(`${this.API_BASE}/modules/${id}`, module);
  }

  deleteModule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/modules/${id}`);
  }

  // ========== AULAS ==========
 getLessonsByModule(courseId: number, moduleId: number) {
  return this.http.get<Aula[]>(
    `/courses/${courseId}/modules/${moduleId}/lessons`
  );
}



 createLesson(
  courseId: number,
  moduleId: number,
  payload: CreateLessonRequest
) {
  return this.http.post(
    `/courses/${courseId}/modules/${moduleId}/lessons/create`,
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
enroll(courseId: number, studentId: number) {
  return this.http.post<EnrollmentResponseDTO>(
    '/enrollments/create',
    { courseId, studentId }
  );
}

  getEnrollment(
  courseId: number,
  userId: number
): Observable<EnrollmentResponseDTO | null> {
  return this.http.get<EnrollmentResponseDTO | null>(
    `${this.API_BASE}/${courseId}/enrollment/${userId}`
  );
}


  // ========== PROGRESSO ==========
  markLessonComplete(enrollmentId: number, lessonId: number): Observable<LessonProgress> {
    return this.http.post<LessonProgress>(
      `${this.API_BASE}/progress/complete`,
      { enrollmentId, lessonId }
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
      `${this.API_BASE}/${courseId}/progress/${userId}`
    );
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
