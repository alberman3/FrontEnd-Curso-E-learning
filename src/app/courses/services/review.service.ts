import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReviewRequest {
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
  id: number;
  studentName: string;
  rating: number;
  comment: string | null;
  reviewDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly API_BASE = '/courses';

  constructor(private http: HttpClient) {}

  // Criar avaliação para um curso
  createReview(courseId: number, request: ReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(
      `${this.API_BASE}/${courseId}/reviews`,
      request
    );
  }

  // Listar avaliações de um curso
  listReviewsByCourse(courseId: number): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(
      `${this.API_BASE}/${courseId}/reviews`
    );
  }

  // Calcular média de avaliações
  calculateAverageRating(reviews: ReviewResponse[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }
}
