import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../model/course';

export interface CreateCourseRequest {
  title: string;
  description: string;
  workload: number;
  categoryIds: number[];
  instructorIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private readonly API_BASE = '/courses';

  constructor(private http: HttpClient) {}

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
}
