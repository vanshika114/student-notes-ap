/**
 * Zustand store for Syllabus Tracker state management
 * Handles all subject, module, and topic operations
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Subject, SyllabusTrackerState } from "./types";
import { generateId } from "./utils";

interface SyllabusStore extends SyllabusTrackerState {
  // Subject operations
  addSubject: (title: string, description?: string) => void;
  deleteSubject: (subjectId: string) => void;
  updateSubject: (subjectId: string, title: string, description?: string) => void;
  setSelectedSubject: (subjectId: string | null) => void;

  // Module operations
  addModule: (subjectId: string, moduleName: string) => void;
  deleteModule: (subjectId: string, moduleId: string) => void;
  updateModule: (subjectId: string, moduleId: string, moduleName: string) => void;
  setSelectedModule: (moduleId: string | null) => void;

  // Topic operations
  addTopic: (subjectId: string, moduleId: string, topicName: string) => void;
  deleteTopic: (subjectId: string, moduleId: string, topicId: string) => void;
  toggleTopic: (subjectId: string, moduleId: string, topicId: string) => void;
  updateTopic: (subjectId: string, moduleId: string, topicId: string, name: string) => void;

  // Data import/export
  exportData: () => string;
  importData: (jsonData: string) => void;
  resetData: () => void;
}

const initialState: SyllabusTrackerState = {
  subjects: [],
  selectedSubjectId: null,
  selectedModuleId: null,
};

export const useSyllabusStore = create<SyllabusStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Subject operations
      addSubject: (title: string, description?: string) => {
        const newSubject: Subject = {
          id: generateId(),
          title,
          description,
          modules: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          subjects: [...state.subjects, newSubject],
          selectedSubjectId: newSubject.id,
        }));
      },

      deleteSubject: (subjectId: string) => {
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== subjectId),
          selectedSubjectId:
            state.selectedSubjectId === subjectId ? null : state.selectedSubjectId,
        }));
      },

      updateSubject: (subjectId: string, title: string, description?: string) => {
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === subjectId
              ? { ...s, title, description, updatedAt: Date.now() }
              : s
          ),
        }));
      },

      setSelectedSubject: (subjectId: string | null) => {
        set({ selectedSubjectId: subjectId, selectedModuleId: null });
      },

      // Module operations
      addModule: (subjectId: string, moduleName: string) => {
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject.id === subjectId
              ? {
                  ...subject,
                  modules: [
                    ...subject.modules,
                    {
                      id: generateId(),
                      name: moduleName,
                      topics: [],
                    },
                  ],
                  updatedAt: Date.now(),
                }
              : subject
          ),
        }));
      },

      deleteModule: (subjectId: string, moduleId: string) => {
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject.id === subjectId
              ? {
                  ...subject,
                  modules: subject.modules.filter((m) => m.id !== moduleId),
                  updatedAt: Date.now(),
                }
              : subject
          ),
          selectedModuleId:
            get().selectedModuleId === moduleId ? null : get().selectedModuleId,
        }));
      },

      updateModule: (subjectId: string, moduleId: string, moduleName: string) => {
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject.id === subjectId
              ? {
                  ...subject,
                  modules: subject.modules.map((m) =>
                    m.id === moduleId ? { ...m, name: moduleName } : m
                  ),
                  updatedAt: Date.now(),
                }
              : subject
          ),
        }));
      },

      setSelectedModule: (moduleId: string | null) => {
        set({ selectedModuleId: moduleId });
      },

      // Topic operations
      addTopic: (subjectId: string, moduleId: string, topicName: string) => {
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject.id === subjectId
              ? {
                  ...subject,
                  modules: subject.modules.map((module) =>
                    module.id === moduleId
                      ? {
                          ...module,
                          topics: [
                            ...module.topics,
                            {
                              id: generateId(),
                              name: topicName,
                              isCompleted: false,
                            },
                          ],
                        }
                      : module
                  ),
                  updatedAt: Date.now(),
                }
              : subject
          ),
        }));
      },

      deleteTopic: (subjectId: string, moduleId: string, topicId: string) => {
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject.id === subjectId
              ? {
                  ...subject,
                  modules: subject.modules.map((module) =>
                    module.id === moduleId
                      ? {
                          ...module,
                          topics: module.topics.filter((t) => t.id !== topicId),
                        }
                      : module
                  ),
                  updatedAt: Date.now(),
                }
              : subject
          ),
        }));
      },

      toggleTopic: (subjectId: string, moduleId: string, topicId: string) => {
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject.id === subjectId
              ? {
                  ...subject,
                  modules: subject.modules.map((module) =>
                    module.id === moduleId
                      ? {
                          ...module,
                          topics: module.topics.map((t) =>
                            t.id === topicId ? { ...t, isCompleted: !t.isCompleted } : t
                          ),
                        }
                      : module
                  ),
                  updatedAt: Date.now(),
                }
              : subject
          ),
        }));
      },

      updateTopic: (subjectId: string, moduleId: string, topicId: string, name: string) => {
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject.id === subjectId
              ? {
                  ...subject,
                  modules: subject.modules.map((module) =>
                    module.id === moduleId
                      ? {
                          ...module,
                          topics: module.topics.map((t) =>
                            t.id === topicId ? { ...t, name } : t
                          ),
                        }
                      : module
                  ),
                  updatedAt: Date.now(),
                }
              : subject
          ),
        }));
      },

      // Data import/export
      exportData: () => {
        const state = get();
        return JSON.stringify(
          {
            subjects: state.subjects,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        );
      },

      importData: (jsonData: string) => {
        try {
          const data = JSON.parse(jsonData);
          if (data.subjects && Array.isArray(data.subjects)) {
            set({ subjects: data.subjects });
          } else {
            throw new Error("Invalid data format");
          }
        } catch (error) {
          console.error("Failed to import data:", error);
          throw new Error("Invalid JSON format");
        }
      },

      resetData: () => {
        set(initialState);
      },
    }),
    {
      name: "syllabus-tracker-storage",
      version: 1,
    }
  )
);
