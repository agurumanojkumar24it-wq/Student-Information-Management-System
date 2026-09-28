import { useMemo, useState } from "react";

import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function Header({
  students = [],
  currentUser = null,
  attendanceRecords = [],
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] =
    useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName =
    currentUser?.name ||
    currentUser?.fullName ||
    "Administrator";

  const displayEmail =
    currentUser?.email ||
    "admin@college.com";

  const initials = getInitials(displayName);

  /* =========================================================
     CALCULATE LOW ATTENDANCE STUDENTS
  ========================================================= */

  const lowAttendance = useMemo(() => {
    return students.filter((student) => {
      const records = attendanceRecords.filter(
        (record) => record.studentId === student.id
      );

      /*
        If no attendance records exist for the student,
        use the original attendance value from student data.
      */

      if (records.length === 0) {
        return Number(student.attendance || 0) < 75;
      }

      const present = records.filter(
        (record) => record.status === "Present"
      ).length;

      const percentage = Math.round(
        (present / records.length) * 100
      );

      return percentage < 75;
    });
  }, [students, attendanceRecords]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 md:px-6">
        {/* LEFT */}

        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white md:flex">
            S
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-900">
              StudentHub
            </h1>

            <p className="hidden text-xs text-slate-500 sm:block">
              Student Information Management System
            </p>
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-2">
          {/* SEARCH */}

          {searchOpen ? (
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
              <Search
                size={17}
                className="text-slate-400"
              />

              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="w-32 bg-transparent px-2 py-2 text-sm outline-none sm:w-52"
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSearchOpen(false);
                  }
                }}
              />

              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title="Search"
            >
              <Search size={20} />
            </button>
          )}

          {/* NOTIFICATIONS */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setNotificationOpen(
                  !notificationOpen
                )
              }
              className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title="Notifications"
            >
              <Bell size={20} />

              {lowAttendance.length > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {lowAttendance.length > 9
                    ? "9+"
                    : lowAttendance.length}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Notifications
                    </h3>

                    <p className="text-xs text-slate-500">
                      Attendance alerts
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setNotificationOpen(false)
                    }
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                  >
                    <X size={16} />
                  </button>
                </div>

                {lowAttendance.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      ✓
                    </div>

                    <p className="text-sm font-medium text-slate-800">
                      No attendance alerts
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      All students have attendance at or above
                      75%.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {lowAttendance.map((student) => {
                      const records =
                        attendanceRecords.filter(
                          (record) =>
                            record.studentId === student.id
                        );

                      let percentage = Number(
                        student.attendance || 0
                      );

                      if (records.length > 0) {
                        const present = records.filter(
                          (record) =>
                            record.status === "Present"
                        ).length;

                        percentage = Math.round(
                          (present / records.length) * 100
                        );
                      }

                      return (
                        <div
                          key={student.id}
                          className="border-b border-slate-100 px-4 py-3 last:border-b-0"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {student.name}
                              </p>

                              <p className="text-xs text-slate-500">
                                {student.course ||
                                  student.department ||
                                  "Student"}
                              </p>
                            </div>

                            <span className="rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-600">
                              {percentage}%
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-red-500">
                            Attendance below 75%
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PROFILE */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setProfileOpen(!profileOpen)
              }
              className="flex items-center gap-2 rounded-xl p-1.5 pr-2 hover:bg-slate-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {initials || "AD"}
              </div>

              <div className="hidden max-w-36 text-left sm:block">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {displayName}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {displayEmail}
                </p>
              </div>

              <ChevronDown
                size={16}
                className="hidden text-slate-400 sm:block"
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                      {initials || "AD"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {displayName}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {displayEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <User size={17} />
                    Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem(
                        "simsLoggedIn"
                      );

                      localStorage.removeItem(
                        "simsCurrentUser"
                      );

                      window.location.reload();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* MOBILE MENU ICON */}

          <button
            type="button"
            className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            title="Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;