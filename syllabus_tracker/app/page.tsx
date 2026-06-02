"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSyllabusStore } from "@/lib/store";
import SubjectList from "@/components/SubjectList";
import SubjectView from "@/components/SubjectView";
import DataManager from "@/components/DataManager";

/**
 * Main Page Content Component
 * Handles routing, deep linking, and main layout
 * Supports URL query parameters for bookmarking: ?subject=<id>&module=<id>
 */
function PageContent() {
  const searchParams = useSearchParams();
  const { subjects, selectedSubjectId, setSelectedSubject } = useSyllabusStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Get selected subject from URL or state
  const urlSubjectId = searchParams.get("subject");
  const urlModuleId = searchParams.get("module");

  const activeSubjectId = urlSubjectId || selectedSubjectId;
  const selectedSubject = subjects.find((s) => s.id === activeSubjectId);

  // Hydration and deep linking
  useEffect(() => {
    setIsHydrated(true);

    // Handle deep linking - update state if URL specifies a subject
    if (urlSubjectId && urlSubjectId !== selectedSubjectId) {
      setSelectedSubject(urlSubjectId);
    }
  }, [urlSubjectId, selectedSubjectId, setSelectedSubject]);

  // Update URL when subject changes
  useEffect(() => {
    if (activeSubjectId && !urlSubjectId) {
      const url = new URL(window.location.href);
      url.searchParams.set("subject", activeSubjectId);
      if (urlModuleId) {
        url.searchParams.set("module", urlModuleId);
      }
      window.history.replaceState({}, "", url);
    }
  }, [activeSubjectId, urlSubjectId, urlModuleId]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-3xl font-bold mb-4">Syllabus Tracker</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 flex flex-col">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/20 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">📚 Syllabus Tracker</h1>
            <p className="text-white/60 text-sm mt-1">
              Track your study progress across subjects, modules, and topics
            </p>
          </div>
          <DataManager />
        </div>
      </header>

      {/* Subjects Navigation */}
      <SubjectList
        selectedSubjectId={activeSubjectId}
        onSelectSubject={(subjectId) => {
          setSelectedSubject(subjectId);
          const url = new URL(window.location.href);
          url.searchParams.set("subject", subjectId);
          url.searchParams.delete("module");
          window.history.pushState({}, "", url);
        }}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {selectedSubject ? (
            <SubjectView subject={selectedSubject} />
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-white mb-4">
                No subject selected
              </h2>
              <p className="text-white/60 mb-6">
                Create or select a subject from above to get started
              </p>
              <div className="inline-block px-6 py-3 bg-white/20 rounded-lg text-white/70 text-sm">
                💡 Tip: You can bookmark your progress by saving the URL with subject
                and module parameters
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md border-t border-white/20 py-4 px-6 text-center text-white/50 text-xs">
        <p>
          📊 All data is saved locally in your browser • 🔒 Your privacy is protected
        </p>
      </footer>
    </div>
  );
}

/**
 * Loading Fallback Component
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-3xl font-bold mb-4">Syllabus Tracker</h1>
        <p>Loading...</p>
      </div>
    </div>
  );
}

/**
 * Main Page Export
 * Wrapped in Suspense for useSearchParams
 */
export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PageContent />
    </Suspense>
  );
}
