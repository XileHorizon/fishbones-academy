import { useEffect } from "react";

const SITE_NAME = "Libre Academy";
const DEFAULT_TITLE = `Learn to code free — 90+ courses, 26 languages | ${SITE_NAME}`;

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
