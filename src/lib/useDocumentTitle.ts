import { useEffect } from "react";
import { COURSE_COUNT_ROUNDED, LANGUAGE_COUNT } from "./siteStats";

const SITE_NAME = "Libre Academy";
const DEFAULT_TITLE = `Learn to code free — ${COURSE_COUNT_ROUNDED} courses, ${LANGUAGE_COUNT} languages | ${SITE_NAME}`;

/**
 * Updates document.title for the current page.
 * Pass a page-specific string and this appends "| Libre Academy".
 * Pass an empty string to restore the homepage default.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title
      ? `${title} | ${SITE_NAME}`
      : DEFAULT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
}
