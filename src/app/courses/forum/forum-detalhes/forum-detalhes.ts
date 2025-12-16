import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Importe seu serviço de Fórum aqui
// import { ForumService } from '../forum.service';

@Component({
  selector: 'app-forum-detalhes',
  templateUrl: './forum-detalhes.html',
  styleUrls: ['./forum-detalhes.scss']
})
export class ForumDetalhesComponent implements OnInit {

  // Variável que irá armazenar os dados da dúvida
  topico: any;
  topicoId: number | null = null;

  // O ActivatedRoute é usado para pegar o ID da URL
  constructor(
    private route: ActivatedRoute,
    // private forumService: ForumService // Injete o serviço aqui
  ) { }

  ngOnInit(): void {
    // 1. Pega o ID da URL (ex: /forum/5)
    this.route.paramMap.subscribe(params => {
      this.topicoId = Number(params.get('id'));

      if (this.topicoId) {
        this.carregarDetalhes(this.topicoId);
      }
    });
  }

  carregarDetalhes(id: number): void {
    // 2. Chama o serviço para buscar os dados daquela dúvida
    // this.forumService.getTopicoDetalhes(id).subscribe(data => {
    //   this.topico = data;
    // });

    // Simulação de dados
    this.topico = {
      id: id,
      titulo: 'Exemplo de Dúvida Carregada',
      respostas: [ /* ... */ ]
    };
  }

  enviarNovaResposta(conteudo: string): void {
    // 3. Lógica para submeter o novo comentário/resposta
    // this.forumService.postNovaResposta(this.topicoId, conteudo).subscribe(...);
    console.log('Enviando resposta para o tópico:', this.topicoId);
  }
}
