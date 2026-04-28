import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";

const Home = lazy(() => import("./pages/Home").then((m) => ({ default: m.Home })));
const Courses = lazy(() => import("./pages/Courses").then((m) => ({ default: m.Courses })));
const CourseDetail = lazy(() =>
  import("./pages/CourseDetail").then((m) => ({ default: m.CourseDetail })),
);
const Languages = lazy(() =>
  import("./pages/Languages").then((m) => ({ default: m.Languages })),
);
const LanguageDetail = lazy(() =>
  import("./pages/LanguageDetail").then((m) => ({ default: m.LanguageDetail })),
);
const Download = lazy(() =>
  import("./pages/Download").then((m) => ({ default: m.Download })),
);
const About = lazy(() => import("./pages/About").then((m) => ({ default: m.About })));
const Docs = lazy(() => import("./pages/Docs").then((m) => ({ default: m.Docs })));
const Privacy = lazy(() =>
  import("./pages/Privacy").then((m) => ({ default: m.Privacy })),
);
const Terms = lazy(() => import("./pages/Terms").then((m) => ({ default: m.Terms })));
const Support = lazy(() =>
  import("./pages/Support").then((m) => ({ default: m.Support })),
);
const NotFound = lazy(() =>
  import("./pages/NotFound").then((m) => ({ default: m.NotFound })),
);

export function App() {
  // Title + description per route. Cheap and works without a meta
  // framework — fishbones.academy is a small static site, not an
  // SEO-critical doc system.
  const { pathname } = useLocation();
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.setAttribute("data-theme-name", "default-dark");
  }, [pathname]);

  return (
    <>
      <ScrollToTop />
      <Nav />
      <main className="app-main">
        <Suspense fallback={<PageBoot />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/languages" element={<Languages />} />
            <Route path="/languages/:slug" element={<LanguageDetail />} />
            <Route path="/download" element={<Download />} />
            <Route path="/pricing" element={<Download />} />
            <Route path="/about" element={<About />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/docs/:section/:page" element={<Docs />} />
            <Route path="/docs/:section" element={<Docs />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/support" element={<Support />} />
            <Route path="/donate" element={<Support />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

function PageBoot() {
  return (
    <div className="page-boot">
      <span className="page-boot__pulse" aria-hidden />
    </div>
  );
}
