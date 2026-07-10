// types/relatorio.ts

export interface Observation {
  id: string;
  date: string;
  text: string;
  createdAt: string;
}

export interface StudentObservation {
  id: string;
  name: string;
  registration: string;
  email: string;
  observations: Observation[];
}