import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../model/course';
import { Modulo } from '../model/modulo';
import { Aula } from '../model/aula';
import { Enrollment } from '../model/enrollment';
import { LessonProgress } from '../model/lesson-progress';

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
    return this.http.post<Course>(this.API_BASE, course);
  }

  update(id: number, course: CreateCourseRequest): Observable<Course> {
    return this.http.put<Course>(`${this.API_BASE}/${id}`, course);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/${id}`);
  }

  getInstructorCourses(instructorId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.API_BASE}/instructor/${instructorId}`);
  }

  getStudentCourses(studentId: number): Observable<StudentCourse[]> {
    return this.http.get<StudentCourse[]>(`${this.API_BASE}/student/${studentId}`);
  }

  // ========== MÓDULOS ==========
  getModulesByCourse(courseId: number): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(`${this.API_BASE}/${courseId}/modules`);
  }

  createModule(module: CreateModuleRequest): Observable<Modulo> {
    return this.http.post<Modulo>(`${this.API_BASE}/modules`, module);
  }

  updateModule(id: number, module: CreateModuleRequest): Observable<Modulo> {
    return this.http.put<Modulo>(`${this.API_BASE}/modules/${id}`, module);
  }

  deleteModule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/modules/${id}`);
  }

  // ========== AULAS ==========
  getLessonsByModule(moduleId: number): Observable<Aula[]> {
    return this.http.get<Aula[]>(`${this.API_BASE}/modules/${moduleId}/lessons`);
  }

  createLesson(lesson: CreateLessonRequest): Observable<Aula> {
    return this.http.post<Aula>(`${this.API_BASE}/lessons`, lesson);
  }

  updateLesson(id: number, lesson: CreateLessonRequest): Observable<Aula> {
    return this.http.put<Aula>(`${this.API_BASE}/lessons/${id}`, lesson);
  }

  deleteLesson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/lessons/${id}`);
  }

  // ========== MATRÍCULA ==========
  enroll(courseId: number, userId: number): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.API_BASE}/${courseId}/enroll`, { userId });
  }

  getEnrollment(courseId: number, userId: number): Observable<Enrollment | null> {
    return this.http.get<Enrollment | null>(
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
