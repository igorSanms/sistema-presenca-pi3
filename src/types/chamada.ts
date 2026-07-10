export type AttendanceStatus =
  | "Presente"
  | "Ausente"
  | "Justificado";

export interface Lesson {
  id: string;
  courseName: string;
  status: AttendanceStatus;
  lastModification: string;
}

export interface StudentAttendance {
  id: string;
  name: string;
  registration: string;
  email: string;
  lessons: Lesson[];
}