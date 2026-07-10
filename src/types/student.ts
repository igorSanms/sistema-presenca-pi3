import type { Lesson } from './lesson';

export interface Student {
  id: string;
  name: string;
  lessons: Lesson[];
}