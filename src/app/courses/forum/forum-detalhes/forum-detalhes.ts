import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { ForumService, TopicResponse, ResponseDTO } from '../../services/forum.service';
import { AuthService } from '../../../auth/services/auth-services';

@Component({
  selector: 'app-forum-detalhes',
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './forum-detalhes.html',
  styleUrls: ['./forum-detalhes.scss']
})
export class ForumDetalhesComponent implements OnInit {
  topic = signal<TopicResponse | null>(null);
  isLoading = signal(true);
  newAnswerForm: FormGroup;
  replyForms = signal<Map<number, FormGroup>>(new Map());
  showReplyForm = signal<Map<number, boolean>>(new Map());

  constructor(
    private forumService: ForumService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.newAnswerForm = this.fb.group({
      content: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const topicId = Number(this.route.snapshot.params['id']);
    if (topicId) {
      this.loadTopic(topicId);
    }
  }

  loadTopic(topicId: number): void {
    this.isLoading.set(true);

    this.forumService.getTopicById(topicId).subscribe({
      next: (data) => {
        this.topic.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar tópico:', err);
        this.snackBar.open('Erro ao carregar tópico', 'Fechar', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  submitAnswer(): void {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Você precisa estar logado para responder', 'Fechar', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    if (this.newAnswerForm.invalid) {
      this.snackBar.open('Digite uma resposta', 'Fechar', { duration: 3000 });
      return;
    }

    const topic = this.topic();
    const userId = this.authService.userId();

    if (!topic || !userId) {
      this.snackBar.open('Erro ao processar resposta', 'Fechar', { duration: 3000 });
      return;
    }

    const request = {
      content: this.newAnswerForm.value.content,
      topicId: topic.id,
      responseParentId: null,
      userId
    };

    this.forumService.createResponse(topic.id, request).subscribe({
      next: () => {
        this.snackBar.open('Resposta publicada!', 'OK', { duration: 2000 });
        this.newAnswerForm.reset();
        this.loadTopic(topic.id);
      },
      error: (err) => {
        console.error('Erro ao criar resposta:', err);
        this.snackBar.open('Erro ao publicar resposta', 'Fechar', { duration: 3000 });
      }
    });
  }

  toggleReplyForm(responseId: number): void {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Você precisa estar logado para responder', 'Fechar', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    const currentMap = new Map(this.showReplyForm());
    const currentValue = currentMap.get(responseId) || false;
    currentMap.set(responseId, !currentValue);
    this.showReplyForm.set(currentMap);

    if (!this.replyForms().has(responseId)) {
      const newForm = this.fb.group({
        content: ['', [Validators.required]]
      });
      const formsMap = new Map(this.replyForms());
      formsMap.set(responseId, newForm);
      this.replyForms.set(formsMap);
    }
  }

  submitReply(parentResponse: ResponseDTO): void {
    const form = this.replyForms().get(parentResponse.id);

    if (!form || form.invalid) {
      this.snackBar.open('Digite uma resposta', 'Fechar', { duration: 3000 });
      return;
    }

    const topic = this.topic();
    const userId = this.authService.userId();

    if (!topic || !userId) {
      this.snackBar.open('Erro ao processar resposta', 'Fechar', { duration: 3000 });
      return;
    }

    const request = {
      content: form.value.content,
      topicId: topic.id,
      responseParentId: parentResponse.id,
      userId
    };

    this.forumService.createResponse(topic.id, request).subscribe({
      next: () => {
        this.snackBar.open('Resposta publicada!', 'OK', { duration: 2000 });
        form.reset();

        const showMap = new Map(this.showReplyForm());
        showMap.set(parentResponse.id, false);
        this.showReplyForm.set(showMap);

        this.loadTopic(topic.id);
      },
      error: (err) => {
        console.error('Erro ao criar resposta:', err);
        this.snackBar.open('Erro ao publicar resposta', 'Fechar', { duration: 3000 });
      }
    });
  }

  deleteResponse(responseId: number): void {
    if (!confirm('Tem certeza que deseja excluir esta resposta?')) {
      return;
    }

    const topic = this.topic();
    if (!topic) return;

    this.forumService.deleteResponse(topic.id, responseId).subscribe({
      next: () => {
        this.snackBar.open('Resposta excluída', 'OK', { duration: 2000 });
        this.loadTopic(topic.id);
      },
      error: (err) => {
        console.error('Erro ao excluir resposta:', err);
        this.snackBar.open('Erro ao excluir resposta', 'Fechar', { duration: 3000 });
      }
    });
  }

  canDeleteResponse(response: ResponseDTO): boolean {
    const userId = this.authService.userId();
    return userId === response.user.id || this.authService.isInstructor();
  }

  goBack(): void {
    const topic = this.topic();
    if (topic) {
      this.router.navigate(['/forum'], { queryParams: { courseId: topic.courseId } });
    } else {
      this.router.navigate(['/forum']);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getReplyForm(responseId: number): FormGroup | undefined {
    return this.replyForms().get(responseId);
  }

  isReplyFormVisible(responseId: number): boolean {
    return this.showReplyForm().get(responseId) || false;
  }
}
