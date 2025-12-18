import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TopicRequest {
  title: string;
  content: string;
  courseId: number;
  userId: number;
}

export interface TopicResponse {
  id: number;
  title: string;
  content: string;
  creationDate: string;
  courseId: number;
  courseTitle: string;
  user: {
    id: number;
    name: string;
    role: string;
  };
  responses: ResponseDTO[];
}

export interface ResponseDTO {
  id: number;
  content: string;
  creationDate: string;
  user: {
    id: number;
    name: string;
    role: string;
  };
  topicId: number;
  responseParentId: number | null;
  childResponses: ResponseDTO[];
}

export interface ResponseRequest {
  content: string;
  topicId: number;
  responseParentId: number | null;
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private readonly API_BASE = '/topics';

  constructor(private http: HttpClient) {}

  // Listar todos os tópicos ou filtrados por curso
  listTopics(courseId?: number): Observable<TopicResponse[]> {
    const url = courseId
      ? `${this.API_BASE}?courseId=${courseId}`
      : this.API_BASE;
    return this.http.get<TopicResponse[]>(url);
  }

  // Obter detalhes de um tópico específico
  getTopicById(topicId: number): Observable<TopicResponse> {
    return this.http.get<TopicResponse>(`${this.API_BASE}/${topicId}`);
  }

  // Criar novo tópico
  createTopic(request: TopicRequest): Observable<TopicResponse> {
    return this.http.post<TopicResponse>(this.API_BASE, request);
  }

  // Atualizar tópico
  updateTopic(topicId: number, request: TopicRequest): Observable<TopicResponse> {
    return this.http.put<TopicResponse>(`${this.API_BASE}/${topicId}`, request);
  }

  // Deletar tópico
  deleteTopic(topicId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/${topicId}`);
  }

  // Listar respostas de um tópico
  listResponses(topicId: number): Observable<ResponseDTO[]> {
    return this.http.get<ResponseDTO[]>(`${this.API_BASE}/${topicId}/responses`);
  }

  // Criar resposta ou reply
  createResponse(topicId: number, request: ResponseRequest): Observable<ResponseDTO> {
    return this.http.post<ResponseDTO>(`${this.API_BASE}/${topicId}/responses`, request);
  }

  // Deletar resposta
  deleteResponse(topicId: number, responseId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/${topicId}/responses/${responseId}`);
  }
}
