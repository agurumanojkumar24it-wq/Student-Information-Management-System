import { useEffect, useState } from "react";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Students from "./pages/students";
import Faculty from "./pages/faculty";
import Courses from "./pages/courses";
import AttendanceMarks from "./pages/attendancemarks";

import Layout from "./components/layout";

import {
  studentsData,
  facultyData,
  coursesData,
  subjectsData,
  marksData,
} from "./data/student";

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    if (saved) {
      return JSON.parse(saved);
    }

    return fallback;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return fallback;
  }
}

function App() {
  /* =========================================================
     LOGIN STATE
  ========================================================= */

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("simsLoggedIn") === "true";
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("simsCurrentUser");

      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  /* =========================================================
     ACTIVE PAGE
  ========================================================= */

  const [activePage, setActivePage] = useState("dashboard");

  /* =========================================================
     STUDENTS
  ========================================================= */

  const [students, setStudents] = useState(() =>
    loadData("students", studentsData)
  );

  /* =========================================================
     FACULTY
  ========================================================= */

  const [faculty, setFaculty] = useState(() =>
    loadData("faculty", facultyData)
  );

  /* =========================================================
     COURSES
  ========================================================= */

  const [courses, setCourses] = useState(() =>
    loadData("courses", coursesData)
  );

  /* =========================================================
     SUBJECTS
  ========================================================= */

  const [subjects, setSubjects] = useState(() =>
    loadData("subjects", subjectsData)
  );

  /* =========================================================
     MARKS
     Step 13:
     Make sure every mark has a unique ID.
  ========================================================= */

  const [marks, setMarks] = useState(() => {
    const savedMarks = loadData("marks", marksData);

    return savedMarks.map((mark, index) => ({
      ...mark,
      id:
        mark.id ||
        `MARK${String(index + 1).padStart(3, "0")}`,
    }));
  });

  /* =========================================================
     ATTENDANCE
  ========================================================= */

  const [attendanceRecords, setAttendanceRecords] = useState(() =>
    loadData("attendanceRecords", [])
  );

  /* =========================================================
     TOAST
  ========================================================= */

  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({
      message,
      type,
    });
  }

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  /* =========================================================
     LOCAL STORAGE SYNC
  ========================================================= */

  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("faculty", JSON.stringify(faculty));
  }, [faculty]);

  useEffect(() => {
    localStorage.setItem("courses", JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("marks", JSON.stringify(marks));
  }, [marks]);

  useEffect(() => {
    localStorage.setItem(
      "attendanceRecords",
      JSON.stringify(attendanceRecords)
    );
  }, [attendanceRecords]);

  /* =========================================================
     LOGIN
  ========================================================= */

  function handleLogin(user) {
    if (user) {
      setCurrentUser(user);

      localStorage.setItem(
        "simsCurrentUser",
        JSON.stringify(user)
      );
    } else {
      try {
        const savedUser =
          localStorage.getItem("simsCurrentUser");

        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } catch {
        setCurrentUser(null);
      }
    }

    localStorage.setItem("simsLoggedIn", "true");

    setIsLoggedIn(true);
    setActivePage("dashboard");
  }

  /* =========================================================
     LOGOUT
  ========================================================= */

  function logout() {
    localStorage.removeItem("simsLoggedIn");
    localStorage.removeItem("simsCurrentUser");

    setCurrentUser(null);
    setIsLoggedIn(false);
    setActivePage("dashboard");
  }

  /* =========================================================
     PAGE RENDERING
  ========================================================= */

  function renderPage() {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            students={students}
            faculty={faculty}
            courses={courses}
            subjects={subjects}
            marks={marks}
            attendanceRecords={attendanceRecords}
            setActivePage={setActivePage}
          />
        );

      case "students":
        return (
          <Students
            students={students}
            setStudents={setStudents}
            marks={marks}
            subjects={subjects}
            attendanceRecords={attendanceRecords}
            showToast={showToast}
          />
        );

      case "faculty":
        return (
          <Faculty
            faculty={faculty}
            setFaculty={setFaculty}
            subjects={subjects}
            showToast={showToast}
          />
        );

      case "courses":
        return (
          <Courses
            courses={courses}
            setCourses={setCourses}
            subjects={subjects}
            setSubjects={setSubjects}
            faculty={faculty}
            showToast={showToast}
          />
        );

      case "attendance":
        return (
          <AttendanceMarks
            students={students}
            subjects={subjects}
            attendanceRecords={attendanceRecords}
            setAttendanceRecords={setAttendanceRecords}
            marks={marks}
            setMarks={setMarks}
            showToast={showToast}
          />
        );

      default:
        return (
          <Dashboard
            students={students}
            faculty={faculty}
            courses={courses}
            subjects={subjects}
            marks={marks}
            attendanceRecords={attendanceRecords}
            setActivePage={setActivePage}
          />
        );
    }
  }

  /* =========================================================
     LOGIN SCREEN
  ========================================================= */

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  /* =========================================================
     MAIN APPLICATION
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      <Layout
        activePage={activePage}
        setActivePage={setActivePage}
        students={students}
        currentUser={currentUser}
        attendanceRecords={attendanceRecords}
        onLogout={logout}
      >
        {renderPage()}
      </Layout>

      {/* =====================================================
          TOAST MESSAGE
      ===================================================== */}

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[9999] rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-xl ${
            toast.type === "error"
              ? "bg-red-600"
              : toast.type === "warning"
              ? "bg-amber-500"
              : "bg-emerald-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;