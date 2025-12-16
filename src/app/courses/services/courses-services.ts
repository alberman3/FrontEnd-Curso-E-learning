import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../model/course';
import { Modulo } from '../model/modulo';

export interface CreateCourseRequest {
  title: string;
  description: string;
  workload: number;
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

  // CURSOS GERAIS
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

  // CURSOS DO INSTRUTOR
  getInstructorCourses(instructorId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.API_BASE}/instructor/${instructorId}`);
  }

  // CURSOS DO ALUNO
  getStudentCourses(studentId: number): Observable<StudentCourse[]> {
    return this.http.get<StudentCourse[]>(`${this.API_BASE}/student/${studentId}`);
  }

  // MÓDULOS
  createModule(module: CreateModuleRequest): Observable<Modulo> {
    return this.http.post<Modulo>(`${this.API_BASE}/modules`, module);
  }

  updateModule(id: number, module: CreateModuleRequest): Observable<Modulo> {
    return this.http.put<Modulo>(`${this.API_BASE}/modules/${id}`, module);
  }

  deleteModule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/modules/${id}`);
  }

  // AULAS
  createLesson(lesson: CreateLessonRequest): Observable<any> {
    return this.http.post<any>(`${this.API_BASE}/lessons`, lesson);
  }

  updateLesson(id: number, lesson: CreateLessonRequest): Observable<any> {
    return this.http.put<any>(`${this.API_BASE}/lessons/${id}`, lesson);
  }

  deleteLesson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/lessons/${id}`);
  }
}
