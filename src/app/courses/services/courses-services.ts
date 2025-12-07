import { Injectable } from '@angular/core';
import { Course } from '../model/course';
// 1. Importação do módulo HTTP
import { HttpClient } from '@angular/common/http';
// 2. Importação dos operadores do RxJS para manipulação do Observable
import { first, delay, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class CoursesServices {
  private readonly API = 'assets/courses.json';

  // O TypeScript agora reconhece 'HttpClient'
  constructor(private httpClient: HttpClient) { }

  list() {
    return this.httpClient.get<Course[]>(this.API)
      .pipe(
        // Os operadores agora são reconhecidos
        first(),
        delay(10000),
        tap(courses => console.log(courses))
      );
  }
}
