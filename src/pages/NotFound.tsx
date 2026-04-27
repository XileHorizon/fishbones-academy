import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function NotFound() {
  return (
    <div className="section section--narrow" style={{ paddingTop: 120, textAlign: "center" }}>
      <span className="section__eyebrow">404</span>
      <h1 className="section__title">Lost the thread.</h1>
      <p className="section__subtitle section__subtitle--centered">
        That page isn't part of the curriculum. Try the catalog, or jump back
        to the home page.
      </p>
      <div style={{ display: "inline-flex", gap: 10, justifyContent: "center" }}>
        <Link to="/" className="btn btn--primary">
          Home <ArrowRight size={14} />
        </Link>
        <Link to="/courses" className="btn btn--ghost">
          Browse courses
        </Link>
      </div>
    </div>
  );
}
