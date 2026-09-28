import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  LogOut,
  X,
} from "lucide-react";

function Sidebar({
  activePage,
  setActivePage,
  logout,
  mobileOpen,
  closeMobile,
  currentUser,
}) {
  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
    },

    {
      id: "students",
      name: "Students",
      icon: Users,
    },

    {
      id: "faculty",
      name: "Faculty",
      icon: GraduationCap,
    },

    {
      id: "courses",
      name: "Courses",
      icon: BookOpen,
    },

    {
      id: "attendance",
      name: "Attendance & Marks",
      icon: ClipboardCheck,
    },
  ];

  /* =======================================================
     NAVIGATION
     ======================================================= */

  function navigate(id) {
    setActivePage(id);
    closeMobile();
  }

  /* =======================================================
     USER
     ======================================================= */

  const userName =
    currentUser?.name ||
    currentUser?.fullName ||
    "Administrator";

  const userEmail =
    currentUser?.email ||
    "admin@college.com";

  const userInitials =
    getInitials(userName);

  return (
    <aside
      className={`sidebar ${
        mobileOpen
          ? "mobile-open"
          : ""
      }`}
    >
      {/* =================================================
          LOGO
          ================================================= */}

      <div className="sidebar-logo">
        <div className="logo-icon">
          <GraduationCap size={25} />
        </div>

        <div className="brand-text">
          <h2>StudentHub</h2>

          <span>
            College Management
          </span>
        </div>

        <button
          type="button"
          className="sidebar-close"
          onClick={closeMobile}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* =================================================
          MENU TITLE
          ================================================= */}

      <div className="menu-title">
        MAIN MENU
      </div>

      {/* =================================================
          MENU
          ================================================= */}

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              type="button"
              key={item.id}
              className={`menu-item ${
                activePage === item.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigate(item.id)
              }
            >
              <Icon size={19} />

              <span>
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* =================================================
          USER / LOGOUT
          ================================================= */}

      <div className="sidebar-bottom">
        <div className="admin-box">
          <div className="avatar">
            {userInitials}
          </div>

          <div>
            <strong>
              {userName}
            </strong>

            <small>
              {userEmail}
            </small>
          </div>
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={logout}
        >
          <LogOut size={18} />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   INITIALS
   ========================================================= */

function getInitials(name = "") {
  const cleanName =
    name.trim();

  if (!cleanName) {
    return "AD";
  }

  const words =
    cleanName.split(/\s+/);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();
}

export default Sidebar;