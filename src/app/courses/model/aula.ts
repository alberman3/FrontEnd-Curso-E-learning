export interface Aula {
  id: number;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  moduleId: number;
  completed?: boolean;
}
