import React, { createContext, useContext, useState, useCallback } from "react";

interface SavedContextType {
  savedIds: Set<string>;
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
}

const SavedContext = createContext<SavedContextType | null>(null);

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem("saved-opportunities");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem("saved-opportunities", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  return (
    <SavedContext.Provider value={{ savedIds, toggleSave, isSaved }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
