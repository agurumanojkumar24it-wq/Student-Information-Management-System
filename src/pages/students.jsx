
import { useMemo, useState } from "react";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  Mail,
  Phone,
  GraduationCap,
  CalendarDays,
  BookOpen,
  UserRound,
  ClipboardCheck,
  Award,
  BarChart3,
} from "lucide-react";

import StudentModal from "../components/studentmodal";

const API_URL = "http://localhost:5000/api/students";

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("simsToken")}`,
  };
}

function Students({
  students = [],
  setStudents,
  marks = [],
  subjects = [],
  attendanceRecords = [],
  showToast,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profileTab, setProfileTab] = useState("overview");

  const filteredStudents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return students;
    }

    return students.filter((student) => {
      return (
        student.id?.toLowerCase().includes(search) ||
        student.name?.toLowerCase().includes(search) ||
        student.email?.toLowerCase().includes(search) ||
        student.phone?.includes(search) ||
        student.department?.toLowerCase().includes(search) ||
        student.course?.toLowerCase().includes(search)
      );
    });
  }, [students, searchTerm]);

  function saveStudents(updatedStudents) {
    setStudents(updatedStudents);
  }

  function openAddModal() {
    setEditingStudent(null);
    setShowModal(true);
  }

  function openEditModal(student) {
    setEditingStudent(student);
    setShowModal(true);
  }

  async function handleSaveStudent(student) {
    try {
      const studentData = {
        studentId: student.id.trim(),
        name: student.name.trim(),
        email: student.email.trim(),
        phone: student.phone,
        department: student.department,
        course: student.course,
        year: student.year,
        section: student.section,
        attendance: Number(student.attendance || 0),
      };

      if (editingStudent) {
        const response = await fetch(
          `${API_URL}/${encodeURIComponent(editingStudent.id)}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(studentData),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          showToast?.(
            data.message || "Failed to update student.",
            "error"
          );
          return;
        }

        const updatedStudent = {
          ...student,
          id: data.data.studentId,
          attendance: Number(data.data.attendance || 0),
        };

        const updatedStudents = students.map((item) =>
          item.id === editingStudent.id
            ? updatedStudent
            : item
        );

        saveStudents(updatedStudents);

        showToast?.("Student updated successfully.");
      } else {
        const exists = students.some(
          (item) => item.id === student.id
        );

        if (exists) {
          showToast?.(
            "Student ID already exists.",
            "error"
          );
          return;
        }

        const response = await fetch(API_URL, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(studentData),
        });

        const data = await response.json();

        if (!response.ok) {
          showToast?.(
            data.message || "Failed to add student.",
            "error"
          );
          return;
        }

        const newStudent = {
          ...student,
          id: data.data.studentId,
          attendance: Number(data.data.attendance || 0),
        };

        saveStudents([...students, newStudent]);

        showToast?.("Student added successfully.");
      }

      setShowModal(false);
      setEditingStudent(null);
    } catch (error) {
      console.error("Student save error:", error);

      showToast?.(
        "Unable to connect to the backend.",
        "error"
      );
    }
  }

  async function deleteStudent(student) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(student.id)}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast?.(
          data.message || "Failed to delete student.",
          "error"
        );
        return;
      }

      const updatedStudents = students.filter(
        (item) => item.id !== student.id
      );

      saveStudents(updatedStudents);

      if (selectedStudent?.id === student.id) {
        setSelectedStudent(null);
      }

      showToast?.("Student deleted successfully.");
    } catch (error) {
      console.error("Student delete error:", error);

      showToast?.(
        "Unable to connect to the backend.",
        "error"
      );
    }
  }

  function openProfile(student) {
    setSelectedStudent(student);
    setProfileTab("overview");
  }

  function getStudentAttendance(studentId) {
    const records = attendanceRecords.filter(
      (record) => record.studentId === studentId
    );

    const total = records.length;

    if (total === 0) {
      const student = students.find(
        (item) => item.id === studentId
      );

      return {
        total: 0,
        present: 0,
        absent: 0,
        percentage: Number(student?.attendance || 0),
      };
    }

    const present = records.filter(
      (record) => record.status === "Present"
    ).length;

    const absent = total - present;

    const percentage =
      total > 0
        ? Math.round((present / total) * 100)
        : 0;

    return {
      total,
      present,
      absent,
      percentage,
    };
  }

  function getStudentMarks(studentId) {
    return marks.filter(
      (mark) => mark.studentId === studentId
    );
  }

  function getSubjectName(mark) {
    const subject = subjects.find(
      (item) =>
        item.id === mark.subjectId ||
        item.code === mark.subject
    );

    return (
      subject?.name ||
      mark.subject ||
      "Unknown Subject"
    );
  }

  function getGrade(score) {
    const marksValue = Number(score || 0);

    if (marksValue >= 90) return "A+";
    if (marksValue >= 80) return "A";
    if (marksValue >= 70) return "B+";
    if (marksValue >= 60) return "B";
    if (marksValue >= 50) return "C";
    if (marksValue >= 40) return "D";

    return "F";
  }

  function getAverageMarks(studentId) {
    const studentMarks = getStudentMarks(studentId);

    if (studentMarks.length === 0) {
      return 0;
    }

    const total = studentMarks.reduce(
      (sum, mark) =>
        sum + Number(mark.marks || 0),
      0
    );

    return Math.round(
      total / studentMarks.length
    );
  }

  const profileAttendanceRecords = selectedStudent
    ? attendanceRecords
        .filter(
          (record) =>
            record.studentId === selectedStudent.id
        )
        .slice()
        .reverse()
    : [];

  const profileMarks = selectedStudent
    ? getStudentMarks(selectedStudent.id)
    : [];

  return (
    <div className="students-page">
      <div className="page-title-row">
        <div>
          <h1>Students</h1>
          <p>
            Manage student information and academic records.
          </p>
        </div>

        <button
          className="primary-btn"
          type="button"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Student
        </button>
      </div>

      <div className="student-summary">
        <div className="summary-card">
          <div className="summary-card-icon blue">
            <UsersIcon />
          </div>

          <div>
            <span>Total Students</span>
            <strong>{students.length}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-icon green">
            <GraduationCap size={20} />
          </div>

          <div>
            <span>Good Attendance</span>

            <strong>
              {
                students.filter(
                  (student) =>
                    getStudentAttendance(student.id)
                      .percentage >= 75
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-icon red">
            <ClipboardCheck size={20} />
          </div>

          <div>
            <span>Low Attendance</span>

            <strong>
              {
                students.filter(
                  (student) =>
                    getStudentAttendance(student.id)
                      .percentage < 75
                ).length
              }
            </strong>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h2>Student Records</h2>

            <p>
              {filteredStudents.length} student
              {filteredStudents.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

          <div className="search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            {searchTerm && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearchTerm("")}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>ID</th>
                <th>Department</th>
                <th>Course</th>
                <th>Year</th>
                <th>Attendance</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="empty-table"
                  >
                    <div className="empty-state">
                      <UsersIcon size={35} />

                      <h3>No students found</h3>

                      <p>
                        Try changing your search or add
                        a new student.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const attendance =
                    getStudentAttendance(student.id);

                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="student-name-cell">
                          <div className="student-avatar">
                            {getInitials(student.name)}
                          </div>

                          <div>
                            <strong>
                              {student.name}
                            </strong>

                            <small>
                              {student.email}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="id-badge">
                          {student.id}
                        </span>
                      </td>

                      <td>
                        <span className="department-text">
                          {student.department}
                        </span>
                      </td>

                      <td>{student.course}</td>

                      <td>{student.year}</td>

                      <td>
                        <div className="attendance-cell">
                          <div className="attendance-top">
                            <span>
                              {attendance.percentage}%
                            </span>
                          </div>

                          <div className="attendance-bar">
                            <div
                              className={
                                attendance.percentage >= 75
                                  ? "attendance-fill good"
                                  : "attendance-fill low"
                              }
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    attendance.percentage
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="action-btn view"
                            title="View Profile"
                            onClick={() =>
                              openProfile(student)
                            }
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            className="action-btn edit"
                            title="Edit Student"
                            onClick={() =>
                              openEditModal(student)
                            }
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            className="action-btn delete"
                            title="Delete Student"
                            onClick={() =>
                              deleteStudent(student)
                            }
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <StudentModal
          student={editingStudent}
          onClose={() => {
            setShowModal(false);
            setEditingStudent(null);
          }}
          onSave={handleSaveStudent}
        />
      )}

      {selectedStudent && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedStudent(null);
            }
          }}
        >
          <div className="student-profile-modal">
            <div className="student-profile-header">
              <div className="student-profile-info">
                <div className="large-student-avatar">
                  {getInitials(selectedStudent.name)}
                </div>

                <div>
                  <h2>{selectedStudent.name}</h2>

                  <p>
                    {selectedStudent.id} •{" "}
                    {selectedStudent.course}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={() =>
                  setSelectedStudent(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="profile-tabs">
              <button
                type="button"
                className={
                  profileTab === "overview"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setProfileTab("overview")
                }
              >
                <UserRound size={16} />
                Overview
              </button>

              <button
                type="button"
                className={
                  profileTab === "attendance"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setProfileTab("attendance")
                }
              >
                <ClipboardCheck size={16} />
                Attendance
              </button>

              <button
                type="button"
                className={
                  profileTab === "marks"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setProfileTab("marks")
                }
              >
                <Award size={16} />
                Marks
              </button>
            </div>

            <div className="profile-content">
              {profileTab === "overview" && (
                <div className="profile-tab-content">
                  <div className="profile-overview-grid">
                    <div className="profile-info-card">
                      <div className="profile-info-icon">
                        <Mail size={19} />
                      </div>

                      <div>
                        <span>Email</span>

                        <strong>
                          {selectedStudent.email}
                        </strong>
                      </div>
                    </div>

                    <div className="profile-info-card">
                      <div className="profile-info-icon">
                        <Phone size={19} />
                      </div>

                      <div>
                        <span>Phone</span>

                        <strong>
                          {selectedStudent.phone}
                        </strong>
                      </div>
                    </div>

                    <div className="profile-info-card">
                      <div className="profile-info-icon">
                        <GraduationCap size={19} />
                      </div>

                      <div>
                        <span>Department</span>

                        <strong>
                          {selectedStudent.department}
                        </strong>
                      </div>
                    </div>

                    <div className="profile-info-card">
                      <div className="profile-info-icon">
                        <BookOpen size={19} />
                      </div>

                      <div>
                        <span>Course</span>

                        <strong>
                          {selectedStudent.course}
                        </strong>
                      </div>
                    </div>

                    <div className="profile-info-card">
                      <div className="profile-info-icon">
                        <CalendarDays size={19} />
                      </div>

                      <div>
                        <span>Year</span>

                        <strong>
                          {selectedStudent.year}
                        </strong>
                      </div>
                    </div>

                    <div className="profile-info-card">
                      <div className="profile-info-icon">
                        <BarChart3 size={19} />
                      </div>

                      <div>
                        <span>Section</span>

                        <strong>
                          {selectedStudent.section}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <div className="profile-section-header">
                      <div>
                        <h3>Academic Summary</h3>

                        <p>
                          Current academic performance
                        </p>
                      </div>
                    </div>

                    <div className="profile-academic-stats">
                      <div className="profile-academic-card primary">
                        <span>Attendance</span>

                        <strong>
                          {
                            getStudentAttendance(
                              selectedStudent.id
                            ).percentage
                          }
                          %
                        </strong>
                      </div>

                      <div className="profile-academic-card">
                        <span>Average Marks</span>

                        <strong>
                          {getAverageMarks(
                            selectedStudent.id
                          )}
                        </strong>
                      </div>

                      <div className="profile-academic-card success">
                        <span>Passed</span>

                        <strong>
                          {
                            profileMarks.filter(
                              (mark) =>
                                Number(mark.marks) >= 40
                            ).length
                          }
                        </strong>
                      </div>

                      <div className="profile-academic-card danger">
                        <span>Failed</span>

                        <strong>
                          {
                            profileMarks.filter(
                              (mark) =>
                                Number(mark.marks) < 40
                            ).length
                          }
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === "attendance" && (
                <div className="profile-tab-content">
                  {(() => {
                    const attendance =
                      getStudentAttendance(
                        selectedStudent.id
                      );

                    return (
                      <>
                        <div className="profile-academic-stats">
                          <div className="profile-academic-card">
                            <span>Total Classes</span>

                            <strong>
                              {attendance.total}
                            </strong>
                          </div>

                          <div className="profile-academic-card success">
                            <span>Present</span>

                            <strong>
                              {attendance.present}
                            </strong>
                          </div>

                          <div className="profile-academic-card danger">
                            <span>Absent</span>

                            <strong>
                              {attendance.absent}
                            </strong>
                          </div>

                          <div className="profile-academic-card primary">
                            <span>Attendance</span>

                            <strong>
                              {attendance.percentage}%
                            </strong>
                          </div>
                        </div>

                        <div className="profile-section">
                          <div className="profile-section-header">
                            <div>
                              <h3>
                                Attendance Summary
                              </h3>

                              <p>
                                Attendance records for
                                this student
                              </p>
                            </div>
                          </div>

                          {profileAttendanceRecords.length ===
                          0 ? (
                            <div className="empty-profile-state">
                              <ClipboardCheck
                                size={32}
                              />

                              <p>
                                No attendance records
                                available.
                              </p>
                            </div>
                          ) : (
                            <div className="profile-attendance-list">
                              {profileAttendanceRecords.map(
                                (
                                  record,
                                  index
                                ) => {
                                  const subject =
                                    subjects.find(
                                      (item) =>
                                        item.id ===
                                          record.subjectId ||
                                        item.code ===
                                          record.subject
                                    );

                                  return (
                                    <div
                                      className="profile-attendance-row"
                                      key={
                                        record.id ||
                                        `${record.studentId}-${record.date}-${index}`
                                      }
                                    >
                                      <div>
                                        <strong>
                                          {subject?.name ||
                                            record.subject ||
                                            "Unknown Subject"}
                                        </strong>

                                        <small>
                                          {record.date ||
                                            "Date not available"}
                                        </small>
                                      </div>

                                      <span
                                        className={
                                          record.status ===
                                          "Present"
                                            ? "attendance-status present"
                                            : "attendance-status absent"
                                        }
                                      >
                                        {record.status}
                                      </span>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {profileTab === "marks" && (
                <div className="profile-tab-content">
                  {(() => {
                    const studentMarks =
                      profileMarks;

                    const average =
                      studentMarks.length > 0
                        ? Math.round(
                            studentMarks.reduce(
                              (sum, mark) =>
                                sum +
                                Number(
                                  mark.marks || 0
                                ),
                              0
                            ) /
                              studentMarks.length
                          )
                        : 0;

                    const passed =
                      studentMarks.filter(
                        (mark) =>
                          Number(mark.marks) >= 40
                      ).length;

                    const failed =
                      studentMarks.filter(
                        (mark) =>
                          Number(mark.marks) < 40
                      ).length;

                    return (
                      <>
                        <div className="profile-academic-stats">
                          <div className="profile-academic-card primary">
                            <span>
                              Total Assessments
                            </span>

                            <strong>
                              {studentMarks.length}
                            </strong>
                          </div>

                          <div className="profile-academic-card">
                            <span>Average Marks</span>

                            <strong>
                              {average}
                            </strong>
                          </div>

                          <div className="profile-academic-card success">
                            <span>Passed</span>

                            <strong>{passed}</strong>
                          </div>

                          <div className="profile-academic-card danger">
                            <span>Failed</span>

                            <strong>{failed}</strong>
                          </div>
                        </div>

                        <div className="profile-section">
                          <div className="profile-section-header">
                            <div>
                              <h3>
                                Academic Performance
                              </h3>

                              <p>
                                Marks recorded for
                                this student
                              </p>
                            </div>
                          </div>

                          {studentMarks.length ===
                          0 ? (
                            <div className="empty-profile-state">
                              <Award size={32} />

                              <p>
                                No marks available.
                              </p>
                            </div>
                          ) : (
                            <div className="profile-marks-table">
                              <div className="profile-marks-header">
                                <span>Subject</span>

                                <span>
                                  Assessment
                                </span>

                                <span>Marks</span>

                                <span>Grade</span>
                              </div>

                              {studentMarks.map(
                                (
                                  mark,
                                  index
                                ) => {
                                  const score =
                                    Number(
                                      mark.marks ||
                                        0
                                    );

                                  const grade =
                                    getGrade(
                                      score
                                    );

                                  return (
                                    <div
                                      className="profile-marks-row"
                                      key={
                                        mark.id ||
                                        `${mark.studentId}-${mark.subject}-${index}`
                                      }
                                    >
                                      <span>
                                        {getSubjectName(
                                          mark
                                        )}
                                      </span>

                                      <span>
                                        {mark.type ||
                                          "Assessment"}
                                      </span>

                                      <strong>
                                        {score}/100
                                      </strong>

                                      <span
                                        className={`grade-badge grade-${grade
                                          .replace(
                                            "+",
                                            "plus"
                                          )
                                          .toLowerCase()}`}
                                      >
                                        {grade}
                                      </span>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="student-profile-footer">
              <button
                type="button"
                className="secondary-btn"
                onClick={() =>
                  setSelectedStudent(null)
                }
              >
                Close
              </button>

              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  setSelectedStudent(null);
                  openEditModal(selectedStudent);
                }}
              >
                <Pencil size={16} />
                Edit Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UsersIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function getInitials(name = "") {
  const words = name.trim().split(/\s+/);

  if (words.length === 0) {
    return "ST";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();
}

export default Students;
