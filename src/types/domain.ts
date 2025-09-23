export type NivelDificuldade = 'Iniciante' | 'Intermediário' | 'Avançado';

export interface Course {
  codigo: string;
  titulo: string;
  descricao?: string | null;
  categoria_id?: string | null;
  instrutor_id?: string | null;
  duracao_estimada?: number | null;
  xp_oferecido?: number | null;
  nivel_dificuldade?: NivelDificuldade | null;
  ativo: boolean;
  pre_requisitos: string[];
}

export interface Module {
  id: string;
  titulo: string;
  ordem: number;
  obrigatorio: boolean;
  xp: number;
  conteudo?: string | null;
}

export interface EnrollmentProgressModule extends Omit<Module,'conteudo'> {
  concluido: boolean;
}

export interface CourseProgress {
  curso: Pick<Course,'codigo'|'titulo'|'duracao_estimada'|'xp_oferecido'> | undefined;
  progresso: number;
  modulos: EnrollmentProgressModule[];
}

export interface CatalogFilters {
  q?: string; categoria?: string; instrutor?: string; nivel?: string; duracaoMax?: number;
}

export interface CatalogItem {
  codigo: string; 
  titulo: string; 
  descricao?: string | null; 
  categoria_id?: string | null;
  duracao_estimada?: number | null; 
  xp_oferecido?: number | null; 
  nivel_dificuldade?: NivelDificuldade | null; 
  pre_requisitos: string[]; 
  idstrutor_id?: string | null;
}

export interface EmployeeDashboard {
  xp_atual: number; nivel_atual: number; proximo_badge: string | null; ranking_departamento: number | null;
  cursos_em_andamento: { codigo: string; titulo: string }[];
  cursos_concluidos: { codigo: string; titulo: string }[];
  timeline: unknown[];
}

export interface InstructorDashboardCourseStat {
  codigo: string; titulo: string; ativo: boolean; inscritos: number; conclusoes: number; taxa_conclusao: number; avaliacao_media: number | null;
}

export interface InstructorDashboard {
  cursos: InstructorDashboardCourseStat[]; pendentes_correcao: number; media_geral_cursos: number | null;
}