/// Trimmed mirror of kata's course schema, sufficient to render the
/// catalog grid + course detail pages. The actual interactive learning
/// surface (workbench, tests, AI tutor) is the embedded /learn/ app and
/// reads the full schema from the same JSON files.

export interface CourseManifestEntry {
  id: string;
  title: string;
  language: string;
  file: string;
  cover?: string;
  sizeBytes?: number;
  packType?: "course" | "challenges";
}

export interface CourseManifest {
  version: number;
  courses: CourseManifestEntry[];
}

export interface CourseLesson {
  id: string;
  title: string;
  kind: "reading" | "exercise" | "mixed" | "quiz";
  body?: string;
  objectives?: string[];
  difficulty?: "easy" | "medium" | "hard";
  topic?: string;
}

export interface CourseChapter {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface FullCourse {
  id: string;
  title: string;
  author?: string;
  description?: string;
  language: string;
  chapters: CourseChapter[];
  packType?: "course" | "challenges";
}
