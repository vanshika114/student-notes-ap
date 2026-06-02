/**
 * Core data types for the Syllabus Tracker
 * Follows the hierarchical structure: Subject -> Module -> Topic
 */

export interface Topic {
  id: string;
  name: string;
  isCompleted: boolean;
  weightage?: number;
}

export interface Module {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  title: string;
  description?: string;
  modules: Module[];
  createdAt: number;
  updatedAt: number;
}

export interface SyllabusTrackerState {
  subjects: Subject[];
  selectedSubjectId: string | null;
  selectedModuleId: string | null;
}
