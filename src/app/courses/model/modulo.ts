import { Aula } from './aula';

export interface Modulo {
  id: number;
  title: string;
  description: string;
  order: number;
  courseId: number;
  lessons?: Aula[];
  completed?: boolean;
}
