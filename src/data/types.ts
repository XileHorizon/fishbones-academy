/// Trimmed mirror of kata's course schema, sufficient to render the
/// catalog grid + course detail pages. The actual interactive learning
/// surface (workbench, tests, AI tutor) is the embedded /learn/ app and
/// reads the full schema from the same JSON files.

/// Editorial release tier — mirrors kata's `Course.releaseStatus`.
/// Pipeline runs `UNREVIEWED` (drafts; bottom of the catalog) →
/// `ALPHA` (next up) → `BETA` (final polish). Missing in the
/// manifest = `UNREVIEWED` (the catalog normalises on read).
export type ReleaseStatus = "UNREVIEWED" | "ALPHA" | "BETA";

export interface CourseManifestEntry {
  id: string;
  title: string;
  language: string;
  file: string;
  cover?: string;
  sizeBytes?: number;
  packType?: "course" | "challenges";
  /// Editorial tier set in the on-disk `course.json`. Drives the
  /// section grouping in the catalog (BETA top, ALPHA middle,
  /// UNREVIEWED bottom).
  releaseStatus?: ReleaseStatus;
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
