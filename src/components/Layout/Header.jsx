// src/components/Layout/Header.jsx
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/images/gyansetu-logo.webp";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useTheme } from "../../hooks/useTheme";
import { useScrolled } from "../../hooks/useScrolled";
import "./Header.css";
import "../../styles/profile.css";

const SITE_URL = "https://gyansetu-classes.github.io/Gyansetu/";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { profile, openModal } = useUserProfile();
  const { theme, toggleTheme } = useTheme();
  const scrolled = useScrolled();

  const closeMenu = () => setMenuOpen(false);

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — nothing else to fall back to.
    }
  };

  const themeToggle = (
    <button
      type="button"
      className="gs-theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span className="material-symbols-outlined">
        {theme === "dark" ? "dark_mode" : "light_mode"}
      </span>
    </button>
  );

  const profileChip = profile && (
    <button
      type="button"
      className="gs-profile-chip"
      onClick={openModal}
      title="Edit your name/avatar"
    >
      <span>{profile.name}</span>
      <span className="gs-profile-chip__avatar">{profile.avatar}</span>
    </button>
  );

  const shareButton = (
    <div className="gs-share-wrap">
      <button
        type="button"
        className="gs-share-btn"
        onClick={handleShareLink}
        aria-label="Copy site link to share"
        title="Copy site link to share"
      >
        <span className="material-symbols-outlined">{linkCopied ? "check" : "share"}</span>
      </button>
      {linkCopied && (
        <span className="gs-share-tooltip" role="status">
          Link copied!
        </span>
      )}
    </div>
  );

  return (
    <header className={`gs-header ${scrolled ? "gs-header--scrolled" : ""}`}>
      <div className="gs-container gs-header-inner">
        <Link to="/" className="gs-logo" onClick={closeMenu}>
          <img src={logo} alt="Gyan Setu Logo" className="gs-logo__img" />
          <span>Gyan Setu</span>
        </Link>

        <nav className="gs-nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/courses">Courses</NavLink>
          <NavLink to="/challenges">Challenges</NavLink>
          <NavLink to="/my-badges">My Badges</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        <div className="gs-header-actions">
          {themeToggle}
          {profileChip}
          {shareButton}

          <button
            type="button"
            className={`gs-nav-toggle ${menuOpen ? "is-open" : ""}`}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="gs-nav-mobile">
          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/courses" onClick={closeMenu}>
            Courses
          </NavLink>
          <NavLink to="/challenges" onClick={closeMenu}>
            Challenges
          </NavLink>
          <NavLink to="/my-badges" onClick={closeMenu}>
            My Badges
          </NavLink>
          <NavLink to="/about" onClick={closeMenu}>
            About
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>
          <div className="gs-nav-mobile__profile">
            {profileChip}
            {shareButton}
          </div>
        </nav>
      )}
    </header>
  );
}
