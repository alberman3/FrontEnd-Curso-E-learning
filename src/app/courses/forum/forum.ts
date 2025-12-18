import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ForumService, TopicResponse } from '../services/forum.service';
import { AuthService } from '../../auth/services/auth-services';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './forum.html',
  styleUrls: ['./forum.scss']
})
export class Forum implements OnInit {
  topics = signal<TopicResponse[]>([]);
  filteredTopics = signal<TopicResponse[]>([]);
  isLoading = signal(true);
  courseId = signal<number | null>(null);
  filterType = signal<string>('recent');
  showNewTopicForm = signal(false);

  newTopicForm: FormGroup;

  constructor(
    private forumService: ForumService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.newTopicForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const courseIdParam = params['courseId'];
      if (courseIdParam) {
        this.courseId.set(Number(courseIdParam));
      }
      this.loadTopics();
    });
  }

  loadTopics(): void {
    this.isLoading.set(true);
    const courseId = this.courseId();

    this.forumService.listTopics(courseId || undefined).subscribe({
      next: (data) => {
        this.topics.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar tópicos:', err);
        this.snackBar.open('Erro ao carregar tópicos', 'Fechar', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  applyFilter(): void {
    const filter = this.filterType();
    let filtered = [...this.topics()];

    switch (filter) {
      case 'recent':
        filtered.sort((a, b) =>
          new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
        );
        break;
      case 'unanswered':
        filtered = filtered.filter(t => t.responses.length === 0);
        break;
      case 'popular':
        filtered.sort((a, b) => b.responses.length - a.responses.length);
        break;
    }

    this.filteredTopics.set(filtered);
  }

  onFilterChange(event: any): void {
    this.filterType.set(event.value);
    this.applyFilter();
  }

  toggleNewTopicForm(): void {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Você precisa estar logado para criar um tópico', 'Fechar', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }
    this.showNewTopicForm.set(!this.showNewTopicForm());
  }

  createTopic(): void {
    if (this.newTopicForm.invalid) {
      this.snackBar.open('Preencha todos os campos obrigatórios', 'Fechar', { duration: 3000 });
      return;
    }

    const userId = this.authService.userId();
    const courseId = this.courseId();

    if (!userId || !courseId) {
      this.snackBar.open('Informações de usuário ou curso não encontradas', 'Fechar', { duration: 3000 });
      return;
    }

    const request = {
      ...this.newTopicForm.value,
      courseId,
      userId
    };

    this.forumService.createTopic(request).subscribe({
      next: (topic) => {
        this.snackBar.open('Tópico criado com sucesso!', 'OK', { duration: 2000 });
        this.newTopicForm.reset();
        this.showNewTopicForm.set(false);
        this.loadTopics();
      },
      error: (err) => {
        console.error('Erro ao criar tópico:', err);
        this.snackBar.open('Erro ao criar tópico', 'Fechar', { duration: 3000 });
      }
    });
  }

  goToTopic(topicId: number): void {
    this.router.navigate(['/forum', topicId]);
  }

  goBack(): void {
    const courseId = this.courseId();
    if (courseId) {
      this.router.navigate(['/cursos', courseId]);
    } else {
      this.router.navigate(['/cursos']);
    }
  }

  getResponseCount(topic: TopicResponse): number {
    return topic.responses.length;
  }

  getLastActivityDate(topic: TopicResponse): string {
    if (topic.responses.length === 0) {
      return this.formatDate(topic.creationDate);
    }

    const lastResponse = topic.responses.reduce((latest, current) =>
      new Date(current.creationDate) > new Date(latest.creationDate) ? current : latest
    );

    return this.formatDate(lastResponse.creationDate);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Agora';
    if (diffHours < 24) return `Há ${diffHours} horas`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;

    return date.toLocaleDateString('pt-BR');
  }
}
