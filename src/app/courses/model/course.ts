import { Instrutor } from './instrutor';
import { Categoria } from './categoria';
import { Modulo } from './modulo';

export interface Course {
  id: number;
  title: string;
  description: string;
  workload: number;

  imageUrl: string;
  price: number;
  oldPrice: number;
  isBestSeller: boolean;

  instructors: Instrutor[];
  categories: Categoria[];

  modules?: Modulo[];
}
