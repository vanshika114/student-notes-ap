/**
 * Pure helper functions for progress calculation
 * These derive state on-the-fly instead of storing redundant percentage values
 */

import { Module, Subject } from "./types";

/**
 * Calculate the progress percentage of a single module
 * Progress = (completed topics / total topics) * 100
 */
export const calculateModuleProgress = (module: Module): number => {
  if (!module.topics.length) return 0;
  const completed = module.topics.filter((t) => t.isCompleted).length;
  return Math.round((completed / module.topics.length) * 100);
};

/**
 * Calculate the progress percentage of a subject
 * Accounts for all topics across all modules
 */
export const calculateSubjectProgress = (subject: Subject): number => {
  const totalTopics = subject.modules.reduce((acc, m) => acc + m.topics.length, 0);
  if (totalTopics === 0) return 0;

  const completedTopics = subject.modules.reduce(
    (acc, m) => acc + m.topics.filter((t) => t.isCompleted).length,
    0
  );

  return Math.round((completedTopics / totalTopics) * 100);
};

/**
 * Get detailed progress stats for a subject
 */
export const getSubjectStats = (subject: Subject) => {
  const totalTopics = subject.modules.reduce((acc, m) => acc + m.topics.length, 0);
  const completedTopics = subject.modules.reduce(
    (acc, m) => acc + m.topics.filter((t) => t.isCompleted).length,
    0
  );

  return {
    totalTopics,
    completedTopics,
    progress: calculateSubjectProgress(subject),
    moduleCount: subject.modules.length,
  };
};

/**
 * Get detailed progress stats for a module
 */
export const getModuleStats = (module: Module) => {
  const totalTopics = module.topics.length;
  const completedTopics = module.topics.filter((t) => t.isCompleted).length;

  return {
    totalTopics,
    completedTopics,
    progress: calculateModuleProgress(module),
  };
};

/**
 * Generate a unique ID using timestamp and random string
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format timestamp to readable date string
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
