import { Link, useLocation } from "react-router-dom";
import { Radar, Bookmark, Menu, X } from "lucide-react";
import { useState } from "react";
import { useSaved } from "@/hooks/use-saved";

/** Top navigation bar for the platform */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { savedIds } = useSaved();

  const links = [
    { to: "/", label: "Discover" },
    { to: "/saved", label: "Saved", count: savedIds.size },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <Radar className="h-6 w-6 text-primary" />
          <span>Opportunity Radar</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`relative rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary ${
                location.pathname === l.to
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {l.label}
              {l.count ? (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                  {l.count}
                </span>
              ) : null}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t md:hidden">
          <div className="container flex flex-col gap-1 py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary ${
                  location.pathname === l.to ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {l.to === "/saved" && <Bookmark className="h-4 w-4" />}
                {l.label}
                {l.count ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                    {l.count}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
