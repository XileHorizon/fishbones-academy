import { CATALOG } from "../data/courses";
import { LANGUAGES } from "../data/languages";

export const COURSE_COUNT = CATALOG.length;
export const LANGUAGE_COUNT = LANGUAGES.length;
export const COURSE_COUNT_ROUNDED = `${Math.floor(COURSE_COUNT / 10) * 10}+`;
