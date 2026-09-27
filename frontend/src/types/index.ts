export type Role = "aluno" | "professor" | "admin";
export type View =
  | "inicio"
  | "perfil"
  | "horarios"
  | "calendario"
  | "eventos"
  | "sugestoes"
  | "admin";

export interface Course {
  id: string;
  name: string;
  acronym: string;
}

export interface SchoolGrade {
  id: string;
  name: string;
  number: number;
  acronym: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  letter: string;
  courseId: string;
  gradeId: string;
  course?: Course;
  grade?: SchoolGrade;
}

export interface AcademicStructure {
  courses: Course[];
  grades: SchoolGrade[];
  classGroups: ClassGroup[];
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: Role;
  courseId?: string | null;
  gradeId?: string | null;
  classGroupId?: string | null;
  course?: Course | null;
  grade?: SchoolGrade | null;
  classGroup?: ClassGroup | null;
  className?: string | null;
}

export interface PasswordResetRequest {
  id: string;
  reason?: string;
  createdAt: string;
  user: User;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  audience: string;
  category: string;
  description: string;
  color: string;
  link?: string;
}

export interface Countdown {
  id: string;
  title: string;
  date: string;
  active: boolean;
}

export type SuggestionStatus = "pendente" | "aprovada" | "reprovada";

export interface Suggestion {
  id: string;
  title: string;
  className: string;
  category: string;
  description: string;
  status: SuggestionStatus;
  createdAt: string;
}

export interface ScheduleItem {
  id: string;
  className: string;
  teacher: string;
  day: number;
  lesson: number;
  subject: string;
}

export type NotificationType = "evento" | "horario";

export interface PortalNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  eventId?: string | null;
  scheduleId?: string | null;
  createdAt: string;
  readAt?: string | null;
}
