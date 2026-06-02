"use client";

import React, { useState } from "react";
import { useSyllabusStore } from "@/lib/store";
import { calculateSubjectProgress, getSubjectStats } from "@/lib/utils";
import ProgressCircle from "./ProgressCircle";

interface SubjectListProps {
  onSelectSubject: (subjectId: string) => void;
  selectedSubjectId: string | null;
}

/**
 * SubjectList Component
 * Displays all subjects in a sidebar with progress indicators
 */
export const SubjectList: React.FC<SubjectListProps> = ({
  onSelectSubject,
  selectedSubjectId,
}) => {
  const { subjects, addSubject } = useSyllabusStore();
  const [newSubjectTitle, setNewSubjectTitle] = useState("");
  const [showAddSubject, setShowAddSubject] = useState(false);

  const handleAddSubject = () => {
    if (newSubjectTitle.trim()) {
      addSubject(newSubjectTitle);
      setNewSubjectTitle("");
      setShowAddSubject(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddSubject();
    } else if (e.key === "Escape") {
      setShowAddSubject(false);
    }
  };

  return (
    <div className="w-full bg-black/20 backdrop-blur-sm border-b border-white/20 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">Subjects</h2>
          {showAddSubject ? (
            <div className="flex gap-2 flex-1 ml-4 max-w-xs">
              <input
                autoFocus
                type="text"
                value={newSubjectTitle}
                onChange={(e) => setNewSubjectTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Subject name..."
                className="flex-1 px-3 py-2 bg-white/20 text-white placeholder-white/50 rounded outline-none focus:ring-2 focus:ring-white/50"
                aria-label="New subject name"
              />
              <button
                onClick={handleAddSubject}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors text-sm"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddSubject(false)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddSubject(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded transition-colors text-sm font-medium"
              aria-label="Add new subject"
            >
              + New Subject
            </button>
          )}
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {subjects.length === 0 ? (
            <div className="col-span-full text-center py-6 text-white/50">
              <p className="text-sm">
                No subjects yet. Create one to get started with tracking your syllabus!
              </p>
            </div>
          ) : (
            subjects.map((subject) => {
              const progress = calculateSubjectProgress(subject);
              const stats = getSubjectStats(subject);
              const isSelected = selectedSubjectId === subject.id;

              return (
                <div
                  key={subject.id}
                  onClick={() => onSelectSubject(subject.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-white/25 border-2 border-white ring-2 ring-white/30"
                      : "bg-white/10 border border-white/20 hover:bg-white/15"
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onSelectSubject(subject.id);
                    }
                  }}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate text-sm">
                        {subject.title}
                      </h3>
                      <p className="text-xs text-white/60 mt-1">
                        {stats.completedTopics}/{stats.totalTopics} done
                      </p>
                    </div>
                    <ProgressCircle
                      percentage={progress}
                      size={60}
                      strokeWidth={4}
                      color={progress === 100 ? "#10b981" : "#3b82f6"}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectList;
