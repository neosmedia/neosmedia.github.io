import NavLinks from "./NavLinks";
import ThemeToggle from "./ThemeToggle";
import NavAvatar from "./NavAvatar";
import ContactIcons from "./ContactIcons";

export default function SiteNav() {
  return (
    <header className="nav">
      <NavAvatar />
      <NavLinks />
      <div className="nav-actions">
        <ThemeToggle />
        <span className="nav-divider" aria-hidden="true" />
        <ContactIcons />
      </div>
    </header>
  );
}
