import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Edit3,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

const ATTENDANCE_API_URL = "http://localhost:5000/api/attendance";
const MARKS_API_URL = "http://localhost:5000/api/marks";

function getGrade(marks) {
  const value = Number(marks);

  if (value >= 90) return "A+";
  if (value >= 80) return "A";
  if (value >= 70) return "B+";
  if (value >= 60) return "B";
  if (value >= 50) return "C";
  if (value >= 40) return "D";

  return "F";
}

function AttendanceMarks({
  students = [],
  subjects = [],
  attendanceRecords = [],
  setAttendanceRecords,
  marks = [],
  setMarks,
  showToast,
}) {
  const [activeTab, setActiveTab] = useState("attendance");

  const [search, setSearch] = useState("");

  const [attendanceForm, setAttendanceForm] = useState({
    studentId: "",
    subjectId: "",
    date: new Date().toISOString().split("T")[0],
    status: "Present",
  });

  const [markForm, setMarkForm] = useState({
    studentId: "",
    subject: "",
    assessmentType: "Internal",
    marks: "",
  });

  const [editingAttendance, setEditingAttendance] = useState(null);
  const [editingMark, setEditingMark] = useState(null);

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showMarkModal, setShowMarkModal] = useState(false);

  /* =========================================================
     LOAD ATTENDANCE FROM MONGODB
  ========================================================= */

  useEffect(() => {
    async function fetchAttendance() {
      const token = localStorage.getItem("simsToken");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(ATTENDANCE_API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          showToast?.(
            data.message || "Failed to load attendance.",
            "error"
          );
          return;
        }

        const mappedAttendance = data.data.map((record) => ({
          ...record,
          id: record.attendanceId,
        }));

        setAttendanceRecords(mappedAttendance);
      } catch (error) {
        console.error(
          "Unable to connect to attendance backend:",
          error
        );

        showToast?.(
          "Unable to connect to attendance backend.",
          "error"
        );
      }
    }

    fetchAttendance();
  }, []);

  /* =========================================================
     LOAD MARKS FROM MONGODB
  ========================================================= */

  useEffect(() => {
    async function fetchMarks() {
      const token = localStorage.getItem("simsToken");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(MARKS_API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          showToast?.(
            data.message || "Failed to load marks.",
            "error"
          );
          return;
        }

        const mappedMarks = data.data.map((record) => ({
          ...record,
          id: record.markId,
        }));

        setMarks(mappedMarks);
      } catch (error) {
        console.error(
          "Unable to connect to marks backend:",
          error
        );

        showToast?.(
          "Unable to connect to marks backend.",
          "error"
        );
      }
    }

    fetchMarks();
  }, []);

  /* =========================================================
     SEARCHED ATTENDANCE
  ========================================================= */

  const filteredAttendance = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return attendanceRecords;
    }

    return attendanceRecords.filter((record) => {
      const student = students.find(
        (item) => item.id === record.studentId
      );

      const subject = subjects.find(
        (item) => item.id === record.subjectId
      );

      return (
        student?.name?.toLowerCase().includes(query) ||
        student?.id?.toLowerCase().includes(query) ||
        subject?.name?.toLowerCase().includes(query) ||
        subject?.code?.toLowerCase().includes(query) ||
        record.date?.toLowerCase().includes(query)
      );
    });
  }, [attendanceRecords, students, subjects, search]);

  /* =========================================================
     FILTERED MARKS
  ========================================================= */

  const filteredMarks = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return marks;
    }

    return marks.filter((mark) => {
      const student = students.find(
        (item) => item.id === mark.studentId
      );

      const subject = subjects.find(
        (item) =>
          item.code === mark.subject ||
          item.id === mark.subject
      );

      return (
        student?.name?.toLowerCase().includes(query) ||
        student?.id?.toLowerCase().includes(query) ||
        mark.subject?.toLowerCase().includes(query) ||
        subject?.name?.toLowerCase().includes(query) ||
        mark.assessmentType?.toLowerCase().includes(query)
      );
    });
  }, [marks, students, subjects, search]);

  /* =========================================================
     ATTENDANCE STATS
  ========================================================= */

  const attendanceStats = useMemo(() => {
    const total = attendanceRecords.length;

    const present = attendanceRecords.filter(
      (record) => record.status === "Present"
    ).length;

    const absent = attendanceRecords.filter(
      (record) => record.status === "Absent"
    ).length;

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
  }, [attendanceRecords]);

  /* =========================================================
     MARK STATS
  ========================================================= */

  const markStats = useMemo(() => {
    const total = marks.length;

    const values = marks.map((mark) => Number(mark.marks));

    const average =
      values.length > 0
        ? Math.round(
            values.reduce(
              (sum, value) => sum + value,
              0
            ) / values.length
          )
        : 0;

    const passed = values.filter(
      (value) => value >= 40
    ).length;

    const failed = values.filter(
      (value) => value < 40
    ).length;

    return {
      total,
      average,
      passed,
      failed,
    };
  }, [marks]);

  /* =========================================================
     RESET ATTENDANCE FORM
  ========================================================= */

  function resetAttendanceForm() {
    setAttendanceForm({
      studentId: "",
      subjectId: "",
      date: new Date().toISOString().split("T")[0],
      status: "Present",
    });

    setEditingAttendance(null);
  }

  /* =========================================================
     RESET MARK FORM
  ========================================================= */

  function resetMarkForm() {
    setMarkForm({
      studentId: "",
      subject: "",
      assessmentType: "Internal",
      marks: "",
    });

    setEditingMark(null);
  }

  /* =========================================================
     ADD / UPDATE ATTENDANCE
  ========================================================= */

  async function handleAttendanceSubmit(event) {
    event.preventDefault();

    const {
      studentId,
      subjectId,
      date,
      status,
    } = attendanceForm;

    if (!studentId) {
      showToast?.("Please select a student.", "error");
      return;
    }

    if (!subjectId) {
      showToast?.("Please select a subject.", "error");
      return;
    }

    if (!date) {
      showToast?.(
        "Please select an attendance date.",
        "error"
      );
      return;
    }

    if (
      status !== "Present" &&
      status !== "Absent"
    ) {
      showToast?.(
        "Attendance status must be Present or Absent.",
        "error"
      );
      return;
    }

    const token = localStorage.getItem("simsToken");

    if (!token) {
      showToast?.("Please login again.", "error");
      return;
    }

    if (editingAttendance) {
      try {
        const response = await fetch(
          `${ATTENDANCE_API_URL}/${editingAttendance.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              studentId,
              subjectId,
              date,
              status,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          showToast?.(
            data.message ||
              "Failed to update attendance.",
            "error"
          );
          return;
        }

        const updatedRecord = {
          ...data.data,
          id: data.data.attendanceId,
        };

        setAttendanceRecords((previous) =>
          previous.map((record) =>
            record.id === editingAttendance.id
              ? updatedRecord
              : record
          )
        );

        showToast?.(
          "Attendance updated successfully."
        );

        resetAttendanceForm();
        setShowAttendanceModal(false);
      } catch (error) {
        console.error(
          "Update attendance error:",
          error
        );

        showToast?.(
          "Unable to connect to attendance backend.",
          "error"
        );
      }

      return;
    }

    try {
      const response = await fetch(
        ATTENDANCE_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId,
            subjectId,
            date,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast?.(
          data.message ||
            "Failed to add attendance.",
          "error"
        );
        return;
      }

      const newRecord = {
        ...data.data,
        id: data.data.attendanceId,
      };

      setAttendanceRecords((previous) => [
        ...previous,
        newRecord,
      ]);

      showToast?.(
        "Attendance added successfully."
      );

      resetAttendanceForm();
      setShowAttendanceModal(false);
    } catch (error) {
      console.error(
        "Add attendance error:",
        error
      );

      showToast?.(
        "Unable to connect to attendance backend.",
        "error"
      );
    }
  }

  /* =========================================================
     EDIT ATTENDANCE
  ========================================================= */

  function handleEditAttendance(record) {
    setEditingAttendance(record);

    setAttendanceForm({
      studentId: record.studentId,
      subjectId: record.subjectId,
      date: record.date,
      status:
        record.status === "Absent"
          ? "Absent"
          : "Present",
    });

    setShowAttendanceModal(true);
  }

  /* =========================================================
     DELETE ATTENDANCE
  ========================================================= */

  async function handleDeleteAttendance(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this attendance record?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("simsToken");

    if (!token) {
      showToast?.("Please login again.", "error");
      return;
    }

    try {
      const response = await fetch(
        `${ATTENDANCE_API_URL}/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast?.(
          data.message ||
            "Failed to delete attendance.",
          "error"
        );
        return;
      }

      setAttendanceRecords((previous) =>
        previous.filter(
          (record) => record.id !== id
        )
      );

      showToast?.(
        "Attendance record deleted."
      );
    } catch (error) {
      console.error(
        "Delete attendance error:",
        error
      );

      showToast?.(
        "Unable to connect to attendance backend.",
        "error"
      );
    }
  }

  /* =========================================================
     ADD / UPDATE MARK
  ========================================================= */

  async function handleMarkSubmit(event) {
    event.preventDefault();

    const {
      studentId,
      subject,
      assessmentType,
      marks: marksInput,
    } = markForm;

    if (!studentId) {
      showToast?.("Please select a student.", "error");
      return;
    }

    if (!subject) {
      showToast?.("Please select a subject.", "error");
      return;
    }

    const markValue = Number(marksInput);

    if (
      Number.isNaN(markValue) ||
      markValue < 0 ||
      markValue > 100
    ) {
      showToast?.(
        "Marks must be between 0 and 100.",
        "error"
      );
      return;
    }

    const token = localStorage.getItem("simsToken");

    if (!token) {
      showToast?.("Please login again.", "error");
      return;
    }

    /* =======================================================
       UPDATE MARK IN MONGODB
    ======================================================= */

    if (editingMark) {
      try {
        const response = await fetch(
          `${MARKS_API_URL}/${editingMark.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              studentId,
              subject,
              assessmentType,
              marks: markValue,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          showToast?.(
            data.message ||
              "Failed to update marks.",
            "error"
          );
          return;
        }

        const updatedMark = {
          ...data.data,
          id: data.data.markId,
        };

        setMarks((previous) =>
          previous.map((mark) =>
            mark.id === editingMark.id
              ? updatedMark
              : mark
          )
        );

        showToast?.(
          "Marks updated successfully."
        );

        resetMarkForm();
        setShowMarkModal(false);
      } catch (error) {
        console.error(
          "Update marks error:",
          error
        );

        showToast?.(
          "Unable to connect to marks backend.",
          "error"
        );
      }

      return;
    }

    /* =======================================================
       CREATE MARK IN MONGODB
    ======================================================= */

    try {
      const response = await fetch(
        MARKS_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId,
            subject,
            assessmentType,
            marks: markValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast?.(
          data.message ||
            "Failed to add marks.",
          "error"
        );
        return;
      }

      const newMark = {
        ...data.data,
        id: data.data.markId,
      };

      setMarks((previous) => [
        ...previous,
        newMark,
      ]);

      showToast?.(
        "Marks added successfully."
      );

      resetMarkForm();
      setShowMarkModal(false);
    } catch (error) {
      console.error(
        "Add marks error:",
        error
      );

      showToast?.(
        "Unable to connect to marks backend.",
        "error"
      );
    }
  }

  /* =========================================================
     EDIT MARK
  ========================================================= */

  function handleEditMark(mark) {
    setEditingMark(mark);

    setMarkForm({
      studentId: mark.studentId,
      subject: mark.subject,
      assessmentType:
        mark.assessmentType || "Internal",
      marks: mark.marks,
    });

    setShowMarkModal(true);
  }

  /* =========================================================
     DELETE MARK FROM MONGODB
  ========================================================= */

  async function handleDeleteMark(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this mark?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("simsToken");

    if (!token) {
      showToast?.("Please login again.", "error");
      return;
    }

    try {
      const response = await fetch(
        `${MARKS_API_URL}/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast?.(
          data.message ||
            "Failed to delete marks.",
          "error"
        );
        return;
      }

      setMarks((previous) =>
        previous.filter(
          (mark) => mark.id !== id
        )
      );

      showToast?.(
        "Marks deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete marks error:",
        error
      );

      showToast?.(
        "Unable to connect to marks backend.",
        "error"
      );
    }
  }

  /* =========================================================
     HELPER FUNCTIONS
  ========================================================= */

  function getStudentName(studentId) {
    return (
      students.find(
        (student) => student.id === studentId
      )?.name || "Unknown Student"
    );
  }

  function getStudentId(studentId) {
    return (
      students.find(
        (student) => student.id === studentId
      )?.id || studentId
    );
  }

  function getSubjectName(subjectId) {
    const subject = subjects.find(
      (item) => item.id === subjectId
    );

    return (
      subject?.name ||
      subject?.code ||
      "Unknown Subject"
    );
  }

  function getSubjectCode(subjectId) {
    const subject = subjects.find(
      (item) => item.id === subjectId
    );

    return subject?.code || subjectId;
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Attendance & Marks
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage student attendance and academic marks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (activeTab === "attendance") {
              resetAttendanceForm();
              setShowAttendanceModal(true);
            } else {
              resetMarkForm();
              setShowMarkModal(true);
            }
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          {activeTab === "attendance"
            ? "Add Attendance"
            : "Add Marks"}
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {activeTab === "attendance" ? (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Total Records
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    {attendanceStats.total}
                  </h2>
                </div>

                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <ClipboardCheck size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Present
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-emerald-600">
                    {attendanceStats.present}
                  </h2>
                </div>

                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Absent
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-red-600">
                    {attendanceStats.absent}
                  </h2>
                </div>

                <div className="rounded-xl bg-red-50 p-3 text-red-600">
                  <XCircle size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Overall Attendance
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-blue-600">
                    {attendanceStats.percentage}%
                  </h2>
                </div>

                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <CalendarDays size={22} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Marks
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {markStats.total}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Average
              </p>
              <h2 className="mt-1 text-2xl font-bold text-blue-600">
                {markStats.average}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Passed
              </p>
              <h2 className="mt-1 text-2xl font-bold text-emerald-600">
                {markStats.passed}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Failed
              </p>
              <h2 className="mt-1 text-2xl font-bold text-red-600">
                {markStats.failed}
              </h2>
            </div>
          </>
        )}
      </div>

      {/* TABS + SEARCH */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("attendance");
                setSearch("");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === "attendance"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Attendance
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("marks");
                setSearch("");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === "marks"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Marks
            </button>
          </div>

          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
            <Search
              size={18}
              className="text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={
                activeTab === "attendance"
                  ? "Search attendance..."
                  : "Search marks..."
              }
              className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* ATTENDANCE TABLE */}

      {activeTab === "attendance" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                    Student
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                    Subject
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                    Date
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-12 text-center"
                    >
                      <ClipboardCheck
                        size={38}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 font-semibold text-slate-700">
                        No attendance records found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Add attendance records to see them here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {getStudentName(record.studentId)}
                        </p>

                        <p className="text-xs text-slate-500">
                          {getStudentId(record.studentId)}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {getSubjectName(record.subjectId)}

                        <span className="ml-2 text-xs text-slate-400">
                          {getSubjectCode(record.subjectId)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {record.date}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            record.status === "Present"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleEditAttendance(record)
                            }
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteAttendance(
                                record.id
                              )
                            }
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MARKS TABLE */}

      {activeTab === "marks" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                    Student
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                    Subject
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                    Assessment
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                    Marks
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                    Grade
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredMarks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-12 text-center"
                    >
                      <ClipboardCheck
                        size={38}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 font-semibold text-slate-700">
                        No marks found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Add marks to see them here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredMarks.map((mark) => (
                    <tr
                      key={mark.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {getStudentName(mark.studentId)}
                        </p>

                        <p className="text-xs text-slate-500">
                          {mark.studentId}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {mark.subject}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {mark.assessmentType || "Internal"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-800">
                          {mark.marks}
                        </span>

                        <span className="text-slate-400">
                          /100
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                          {getGrade(mark.marks)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleEditMark(mark)
                            }
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteMark(mark.id)
                            }
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ATTENDANCE MODAL */}

      {showAttendanceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-900">
                  {editingAttendance
                    ? "Edit Attendance"
                    : "Add Attendance"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Record student attendance.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetAttendanceForm();
                  setShowAttendanceModal(false);
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleAttendanceSubmit}
              className="space-y-4 p-5"
            >
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Student
                </label>

                <select
                  value={attendanceForm.studentId}
                  onChange={(event) =>
                    setAttendanceForm({
                      ...attendanceForm,
                      studentId: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select student
                  </option>

                  {students.map((student) => (
                    <option
                      key={student.id}
                      value={student.id}
                    >
                      {student.name} ({student.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Subject
                </label>

                <select
                  value={attendanceForm.subjectId}
                  onChange={(event) =>
                    setAttendanceForm({
                      ...attendanceForm,
                      subjectId: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select subject
                  </option>

                  {subjects.map((subject) => (
                    <option
                      key={subject.id}
                      value={subject.id}
                    >
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Date
                </label>

                <input
                  type="date"
                  value={attendanceForm.date}
                  onChange={(event) =>
                    setAttendanceForm({
                      ...attendanceForm,
                      date: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Status
                </label>

                <select
                  value={attendanceForm.status}
                  onChange={(event) =>
                    setAttendanceForm({
                      ...attendanceForm,
                      status: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="Present">
                    Present
                  </option>

                  <option value="Absent">
                    Absent
                  </option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetAttendanceForm();
                    setShowAttendanceModal(false);
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {editingAttendance
                    ? "Update Attendance"
                    : "Save Attendance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MARK MODAL */}

      {showMarkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-900">
                  {editingMark
                    ? "Edit Marks"
                    : "Add Marks"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Enter marks between 0 and 100.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetMarkForm();
                  setShowMarkModal(false);
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleMarkSubmit}
              className="space-y-4 p-5"
            >
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Student
                </label>

                <select
                  value={markForm.studentId}
                  onChange={(event) =>
                    setMarkForm({
                      ...markForm,
                      studentId: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select student
                  </option>

                  {students.map((student) => (
                    <option
                      key={student.id}
                      value={student.id}
                    >
                      {student.name} ({student.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Subject
                </label>

                <select
                  value={markForm.subject}
                  onChange={(event) =>
                    setMarkForm({
                      ...markForm,
                      subject: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select subject
                  </option>

                  {subjects.map((subject) => (
                    <option
                      key={subject.id}
                      value={subject.code}
                    >
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Assessment Type
                </label>

                <select
                  value={markForm.assessmentType}
                  onChange={(event) =>
                    setMarkForm({
                      ...markForm,
                      assessmentType:
                        event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="Internal">
                    Internal
                  </option>

                  <option value="Mid Term">
                    Mid Term
                  </option>

                  <option value="End Semester">
                    End Semester
                  </option>

                  <option value="Assignment">
                    Assignment
                  </option>

                  <option value="Lab">
                    Lab
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Marks
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={markForm.marks}
                  onChange={(event) =>
                    setMarkForm({
                      ...markForm,
                      marks: event.target.value,
                    })
                  }
                  placeholder="Enter marks (0-100)"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Allowed range: 0 to 100
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetMarkForm();
                    setShowMarkModal(false);
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {editingMark
                    ? "Update Marks"
                    : "Save Marks"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceMarks;