import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ClipboardCheck,
  UserPlus,
  BookMarked,
} from "lucide-react";

function Dashboard({
  students = [],
  faculty = [],
  courses = [],
  subjects = [],
  marks = [],
  attendanceRecords = [],
  setActivePage,
}) {
  /* =========================================================
     HELPERS
  ========================================================= */

  function getStudent(studentId) {
    return students.find(
      (student) => student.id === studentId
    );
  }

  function getSubject(subjectId) {
    return subjects.find(
      (subject) => subject.id === subjectId
    );
  }

  function calculateStudentAttendance(studentId) {
    const records = attendanceRecords.filter(
      (record) => record.studentId === studentId
    );

    if (records.length === 0) {
      return 0;
    }

    const present = records.filter(
      (record) => record.status === "Present"
    ).length;

    return Math.round(
      (present / records.length) * 100
    );
  }

  function getGrade(mark) {
    const value = Number(mark);

    if (value >= 90) return "A+";
    if (value >= 80) return "A";
    if (value >= 70) return "B+";
    if (value >= 60) return "B";
    if (value >= 50) return "C";
    if (value >= 40) return "D";

    return "F";
  }

  /* =========================================================
     ATTENDANCE
  ========================================================= */

  const totalAttendanceRecords =
    attendanceRecords.length;

  const presentRecords = attendanceRecords.filter(
    (record) => record.status === "Present"
  ).length;

  const overallAttendance =
    totalAttendanceRecords > 0
      ? Math.round(
          (presentRecords / totalAttendanceRecords) * 100
        )
      : 0;

  /* =========================================================
     MARKS
  ========================================================= */

  const markValues = marks.map((mark) =>
    Number(mark.marks)
  );

  const averageMarks =
    markValues.length > 0
      ? Math.round(
          markValues.reduce(
            (sum, value) => sum + value,
            0
          ) / markValues.length
        )
      : 0;

  const passedRecords = markValues.filter(
    (value) => value >= 40
  ).length;

  const failedRecords = markValues.filter(
    (value) => value < 40
  ).length;

  /* =========================================================
     STUDENT ATTENDANCE
  ========================================================= */

  const studentAttendance = students.map((student) => ({
    ...student,
    calculatedAttendance:
      attendanceRecords.length > 0
        ? calculateStudentAttendance(student.id)
        : Number(student.attendance || 0),
  }));

  const lowAttendanceStudents =
    studentAttendance.filter(
      (student) => student.calculatedAttendance < 75
    );

  /* =========================================================
     PERFORMANCE
  ========================================================= */

  const studentPerformance = students.map((student) => {
    const studentMarks = marks.filter(
      (mark) => mark.studentId === student.id
    );

    const values = studentMarks.map((mark) =>
      Number(mark.marks)
    );

    const average =
      values.length > 0
        ? Math.round(
            values.reduce(
              (sum, value) => sum + value,
              0
            ) / values.length
          )
        : 0;

    return {
      ...student,
      average,
      records: studentMarks.length,
    };
  });

  const performanceStudents =
    studentPerformance
      .filter((student) => student.records > 0)
      .sort((a, b) => b.average - a.average)
      .slice(0, 5);

  /* =========================================================
     RECENT ACTIVITY
  ========================================================= */

  const recentAttendance = [...attendanceRecords]
    .sort((a, b) =>
      b.date.localeCompare(a.date)
    )
    .slice(0, 5);

  const recentMarks = [...marks]
    .slice(-5)
    .reverse();

  /* =========================================================
     QUICK ACTION
  ========================================================= */

  function goTo(page) {
    setActivePage(page);
  }

  return (
    <div className="dashboard-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="dashboard-hero">

        <div className="dashboard-hero-content">

          <div className="dashboard-hero-badge">
            <GraduationCap size={15} />
            Student Information Management System
          </div>

          <h1>
            College Administration
            <br />
            Dashboard
          </h1>

          <p>
            Manage students, faculty, courses,
            attendance and academic performance
            from one place.
          </p>

          <div className="dashboard-hero-actions">

            <button
              className="hero-primary-btn"
              onClick={() => goTo("students")}
            >
              <Users size={17} />
              Manage Students
            </button>

            <button
              className="hero-secondary-btn"
              onClick={() => goTo("attendance")}
            >
              <ClipboardCheck size={17} />
              Academic Records
            </button>

          </div>

        </div>

        <div className="dashboard-hero-visual">
          <div className="hero-visual-card">
            <GraduationCap size={62} />
            <strong>Academic</strong>
            <span>Management</span>
          </div>
        </div>

      </section>

      {/* =====================================================
          MAIN STAT CARDS
      ===================================================== */}

      <div className="dashboard-stat-grid">

        <button
          className="dashboard-stat-card"
          onClick={() => goTo("students")}
        >
          <div className="dashboard-stat-icon blue">
            <Users size={22} />
          </div>

          <div>
            <span>Total Students</span>
            <strong>{students.length}</strong>
            <small>
              <CheckCircle2 size={13} />
              Active records
            </small>
          </div>

          <ArrowRight className="dashboard-stat-arrow" size={17} />
        </button>

        <button
          className="dashboard-stat-card"
          onClick={() => goTo("faculty")}
        >
          <div className="dashboard-stat-icon purple">
            <GraduationCap size={22} />
          </div>

          <div>
            <span>Total Faculty</span>
            <strong>{faculty.length}</strong>
            <small>
              <CheckCircle2 size={13} />
              Faculty members
            </small>
          </div>

          <ArrowRight className="dashboard-stat-arrow" size={17} />
        </button>

        <button
          className="dashboard-stat-card"
          onClick={() => goTo("courses")}
        >
          <div className="dashboard-stat-icon green">
            <BookOpen size={22} />
          </div>

          <div>
            <span>Total Courses</span>
            <strong>{courses.length}</strong>
            <small>
              <BookMarked size={13} />
              {subjects.length} subjects
            </small>
          </div>

          <ArrowRight className="dashboard-stat-arrow" size={17} />
        </button>

        <button
          className="dashboard-stat-card"
          onClick={() => goTo("attendance")}
        >
          <div className="dashboard-stat-icon orange">
            <CalendarCheck size={22} />
          </div>

          <div>
            <span>Overall Attendance</span>
            <strong>{overallAttendance}%</strong>
            <small>
              <TrendingUp size={13} />
              {totalAttendanceRecords} records
            </small>
          </div>

          <ArrowRight className="dashboard-stat-arrow" size={17} />
        </button>

      </div>

      {/* =====================================================
          ACADEMIC OVERVIEW
      ===================================================== */}

      <section className="dashboard-section">

        <div className="dashboard-section-heading">
          <div>
            <h2>Academic Overview</h2>
            <p>
              Current academic performance from recorded data.
            </p>
          </div>

          <Award size={22} />
        </div>

        <div className="academic-overview-grid">

          <div className="academic-overview-card blue-card">

            <div className="academic-overview-top">
              <span>Average Marks</span>

              <div className="academic-overview-icon">
                <Award size={19} />
              </div>
            </div>

            <strong>{averageMarks}</strong>

            <div className="overview-progress">
              <div
                style={{
                  width: `${averageMarks}%`,
                }}
              />
            </div>

            <small>
              Based on {marks.length} mark records
            </small>

          </div>

          <div className="academic-overview-card green-card">

            <div className="academic-overview-top">
              <span>Passed</span>

              <div className="academic-overview-icon">
                <CheckCircle2 size={19} />
              </div>
            </div>

            <strong>{passedRecords}</strong>

            <small>
              Academic records with 40+ marks
            </small>

          </div>

          <div className="academic-overview-card red-card">

            <div className="academic-overview-top">
              <span>Failed</span>

              <div className="academic-overview-icon">
                <AlertTriangle size={19} />
              </div>
            </div>

            <strong>{failedRecords}</strong>

            <small>
              Records requiring attention
            </small>

          </div>

          <div className="academic-overview-card purple-card">

            <div className="academic-overview-top">
              <span>Attendance Records</span>

              <div className="academic-overview-icon">
                <CalendarCheck size={19} />
              </div>
            </div>

            <strong>{attendanceRecords.length}</strong>

            <small>
              Daily attendance entries
            </small>

          </div>

        </div>

      </section>

      {/* =====================================================
          CHARTS
      ===================================================== */}

      <div className="dashboard-two-column">

        {/* ATTENDANCE */}

        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>Student Attendance</h2>
              <p>
                Attendance percentage by student.
              </p>
            </div>

            <CalendarCheck size={20} />

          </div>

          <div className="dashboard-attendance-list">

            {studentAttendance.length === 0 ? (
              <div className="dashboard-empty">
                <Users size={32} />
                <p>No students available.</p>
              </div>
            ) : (
              studentAttendance.map((student) => {

                const percentage =
                  student.calculatedAttendance;

                return (
                  <div
                    className="dashboard-attendance-row"
                    key={student.id}
                  >

                    <div className="dashboard-student-info">

                      <div className="dashboard-mini-avatar">
                        {student.name
                          .split(" ")
                          .map((word) => word[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {student.name}
                        </strong>

                        <small>
                          {student.id}
                        </small>
                      </div>

                    </div>

                    <div className="dashboard-attendance-bar">

                      <div className="dashboard-bar-track">

                        <div
                          className={
                            percentage < 75
                              ? "danger-bar"
                              : "normal-bar"
                          }
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                      <strong
                        className={
                          percentage < 75
                            ? "danger-text"
                            : ""
                        }
                      >
                        {percentage}%
                      </strong>

                    </div>

                  </div>
                );
              })
            )}

          </div>

        </section>

        {/* PERFORMANCE */}

        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>Performance Overview</h2>
              <p>
                Student average marks.
              </p>
            </div>

            <Award size={20} />

          </div>

          <div className="dashboard-performance-list">

            {performanceStudents.length === 0 ? (
              <div className="dashboard-empty">
                <Award size={32} />
                <p>No marks available.</p>
              </div>
            ) : (
              performanceStudents.map(
                (student, index) => (
                  <div
                    className="dashboard-performance-row"
                    key={student.id}
                  >

                    <div className="performance-rank">
                      {index + 1}
                    </div>

                    <div className="performance-student">
                      <strong>
                        {student.name}
                      </strong>

                      <small>
                        {student.records} record
                        {student.records !== 1
                          ? "s"
                          : ""}
                      </small>
                    </div>

                    <div className="performance-score">

                      <strong>
                        {student.average}
                      </strong>

                      <span>
                        {getGrade(student.average)}
                      </span>

                    </div>

                  </div>
                )
              )
            )}

          </div>

        </section>

      </div>

      {/* =====================================================
          ATTENTION + QUICK ACTIONS
      ===================================================== */}

      <div className="dashboard-two-column">

        {/* ATTENTION */}

        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>Attention Required</h2>
              <p>
                Students below the 75% attendance
                requirement.
              </p>
            </div>

            <AlertTriangle size={20} />

          </div>

          {lowAttendanceStudents.length === 0 ? (
            <div className="dashboard-success-box">
              <CheckCircle2 size={28} />

              <div>
                <strong>Everything looks good</strong>
                <p>
                  No student is currently below
                  75% attendance.
                </p>
              </div>
            </div>
          ) : (
            <div className="attention-list">

              {lowAttendanceStudents.map(
                (student) => (
                  <button
                    className="attention-item"
                    key={student.id}
                    onClick={() => goTo("students")}
                  >

                    <div className="attention-avatar">
                      {student.name
                        .split(" ")
                        .map((word) => word[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div className="attention-info">

                      <strong>
                        {student.name}
                      </strong>

                      <small>
                        {student.department}
                      </small>

                    </div>

                    <div className="attention-percent">
                      {student.calculatedAttendance}%
                    </div>

                  </button>
                )
              )}

            </div>
          )}

        </section>

        {/* QUICK ACTIONS */}

        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>Quick Actions</h2>
              <p>
                Frequently used management tools.
              </p>
            </div>

            <TrendingUp size={20} />

          </div>

          <div className="dashboard-quick-actions">

            <button
              onClick={() => goTo("students")}
            >
              <div className="quick-action-icon blue">
                <UserPlus size={19} />
              </div>

              <div>
                <strong>Add / Manage Students</strong>
                <span>
                  Manage student information
                </span>
              </div>

              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => goTo("faculty")}
            >
              <div className="quick-action-icon purple">
                <GraduationCap size={19} />
              </div>

              <div>
                <strong>Manage Faculty</strong>
                <span>
                  Faculty members and assignments
                </span>
              </div>

              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => goTo("courses")}
            >
              <div className="quick-action-icon green">
                <BookOpen size={19} />
              </div>

              <div>
                <strong>Manage Courses</strong>
                <span>
                  Courses and subjects
                </span>
              </div>

              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => goTo("attendance")}
            >
              <div className="quick-action-icon orange">
                <ClipboardCheck size={19} />
              </div>

              <div>
                <strong>Academic Records</strong>
                <span>
                  Attendance and marks
                </span>
              </div>

              <ArrowRight size={17} />
            </button>

          </div>

        </section>

      </div>

      {/* =====================================================
          RECENT ACTIVITY
      ===================================================== */}

      <section className="dashboard-section">

        <div className="dashboard-section-heading">

          <div>
            <h2>Recent Academic Activity</h2>
            <p>
              Latest attendance and marks records.
            </p>
          </div>

          <ClipboardCheck size={22} />

        </div>

        <div className="recent-activity-grid">

          <div className="recent-activity-card">

            <div className="recent-card-heading">
              <div>
                <h3>Recent Attendance</h3>
                <span>
                  Latest attendance entries
                </span>
              </div>

              <CalendarCheck size={18} />
            </div>

            {recentAttendance.length === 0 ? (
              <div className="recent-empty">
                No attendance records yet.
              </div>
            ) : (
              <div className="recent-list">

                {recentAttendance.map(
                  (record) => {

                    const student =
                      getStudent(record.studentId);

                    const subject =
                      getSubject(record.subjectId);

                    return (
                      <div
                        className="recent-item"
                        key={record.id}
                      >

                        <div className="recent-item-icon">
                          {record.status ===
                          "Present" ? (
                            <CheckCircle2 size={17} />
                          ) : (
                            <AlertTriangle size={17} />
                          )}
                        </div>

                        <div>
                          <strong>
                            {student?.name ||
                              record.studentId}
                          </strong>

                          <span>
                            {subject?.code ||
                              record.subjectId}{" "}
                            • {record.date}
                          </span>
                        </div>

                        <b
                          className={
                            record.status ===
                            "Present"
                              ? "recent-present"
                              : "recent-absent"
                          }
                        >
                          {record.status}
                        </b>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

          <div className="recent-activity-card">

            <div className="recent-card-heading">
              <div>
                <h3>Recent Marks</h3>
                <span>
                  Latest academic results
                </span>
              </div>

              <Award size={18} />
            </div>

            {recentMarks.length === 0 ? (
              <div className="recent-empty">
                No marks records yet.
              </div>
            ) : (
              <div className="recent-list">

                {recentMarks.map((mark) => {

                  const student =
                    getStudent(mark.studentId);

                  const subject =
                    getSubject(mark.subjectId);

                  return (
                    <div
                      className="recent-item"
                      key={mark.id}
                    >

                      <div className="recent-item-icon marks">
                        <Award size={17} />
                      </div>

                      <div>
                        <strong>
                          {student?.name ||
                            mark.studentId}
                        </strong>

                        <span>
                          {subject?.code ||
                            mark.subject}{" "}
                          • {mark.type || "Internal"}
                        </span>
                      </div>

                      <b className="recent-mark-value">
                        {mark.marks}
                      </b>

                    </div>
                  );
                })}

              </div>
            )}

          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;