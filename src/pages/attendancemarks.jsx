
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

const API_BASE =
  "https://student-information-management-syst-henna.vercel.app/api";

const ATTENDANCE_API_URL = `${API_BASE}/attendance`;
const MARKS_API_URL = `${API_BASE}/marks`;

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
  const [loading, setLoading] = useState(false);

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

  // Normalize student fields so IDs work with different data formats.
  const normalizedStudents = useMemo(() => {
    return students.map((student) => ({
      ...student,
      id: String(
        student.id ??
        student._id ??
        student.studentId ??
        student.rollNo ??
        ""
      ),
      name: String(
        student.name ??
        student.studentName ??
        "Unnamed Student"
      ),
    })).filter((student) => student.id);
  }, [students]);

  // Normalize subject fields, including MongoDB _id.
  const normalizedSubjects = useMemo(() => {
    return subjects.map((subject) => {
      const id =
        subject.id ??
        subject._id ??
        subject.subjectId ??
        subject.subjectCode ??
        subject.code;

      return {
        ...subject,
        id: id == null ? "" : String(id),
        code: String(
          subject.code ??
          subject.subjectCode ??
          subject.subject_code ??
          ""
        ),
        name: String(
          subject.name ??
          subject.subjectName ??
          subject.subject_name ??
          subject.subject ??
          subject.title ??
          ""
        ),
      };
    }).filter((subject) => subject.id);
  }, [subjects]);

  function getToken() {
    return localStorage.getItem("simsToken");
  }

  function getRecordId(record, type) {
    if (type === "attendance") {
      return record.attendanceId ?? record._id ?? record.id;
    }
    return record.markId ?? record._id ?? record.id;
  }

  function getStudentName(studentId) {
    return (
      normalizedStudents.find(
        (student) => student.id === String(studentId)
      )?.name || "Unknown Student"
    );
  }

  function getSubject(subjectId) {
    return normalizedSubjects.find(
      (subject) =>
        subject.id === String(subjectId) ||
        subject.code === String(subjectId)
    );
  }

  function getSubjectName(subjectId) {
    const subject = getSubject(subjectId);
    return subject?.name || subject?.code || "Unknown Subject";
  }

  function getSubjectCode(subjectId) {
    const subject = getSubject(subjectId);
    return subject?.code || "";
  }

  function notify(message, type = "success") {
    showToast?.(message, type);
  }

  // Load attendance records from the backend.
  useEffect(() => {
    async function fetchAttendance() {
      const token = getToken();
      if (!token) return;

      try {
        const response = await fetch(ATTENDANCE_API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          notify(result.message || "Failed to load attendance.", "error");
          return;
        }

        const records = Array.isArray(result.data) ? result.data : [];
        setAttendanceRecords(
          records.map((record) => ({
            ...record,
            id: String(getRecordId(record, "attendance")),
            studentId: String(record.studentId ?? ""),
            subjectId: String(record.subjectId ?? ""),
          }))
        );
      } catch (error) {
        console.error("Attendance loading error:", error);
        notify("Unable to connect to attendance backend.", "error");
      }
    }

    fetchAttendance();
  }, []);

  // Load marks from the backend.
  useEffect(() => {
    async function fetchMarks() {
      const token = getToken();
      if (!token) return;

      try {
        const response = await fetch(MARKS_API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          notify(result.message || "Failed to load marks.", "error");
          return;
        }

        const records = Array.isArray(result.data) ? result.data : [];
        setMarks(
          records.map((record) => ({
            ...record,
            id: String(getRecordId(record, "marks")),
            studentId: String(record.studentId ?? ""),
          }))
        );
      } catch (error) {
        console.error("Marks loading error:", error);
        notify("Unable to connect to marks backend.", "error");
      }
    }

    fetchMarks();
  }, []);

  const filteredAttendance = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return attendanceRecords;

    return attendanceRecords.filter((record) => {
      const studentName = getStudentName(record.studentId).toLowerCase();
      const subjectName = getSubjectName(record.subjectId).toLowerCase();
      const subjectCode = getSubjectCode(record.subjectId).toLowerCase();

      return (
        studentName.includes(query) ||
        String(record.studentId).toLowerCase().includes(query) ||
        subjectName.includes(query) ||
        subjectCode.includes(query) ||
        String(record.date ?? "").toLowerCase().includes(query)
      );
    });
  }, [attendanceRecords, normalizedStudents, normalizedSubjects, search]);

  const filteredMarks = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return marks;

    return marks.filter((mark) => {
      const studentName = getStudentName(mark.studentId).toLowerCase();
      const subjectName = getSubjectName(mark.subject).toLowerCase();

      return (
        studentName.includes(query) ||
        String(mark.studentId).toLowerCase().includes(query) ||
        String(mark.subject ?? "").toLowerCase().includes(query) ||
        subjectName.includes(query) ||
        String(mark.assessmentType ?? "").toLowerCase().includes(query)
      );
    });
  }, [marks, normalizedStudents, normalizedSubjects, search]);

  const attendanceStats = useMemo(() => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(
      (record) => record.status === "Present"
    ).length;
    const absent = attendanceRecords.filter(
      (record) => record.status === "Absent"
    ).length;

    return {
      total,
      present,
      absent,
      percentage: total ? Math.round((present / total) * 100) : 0,
    };
  }, [attendanceRecords]);

  const markStats = useMemo(() => {
    const values = marks.map((mark) => Number(mark.marks));
    const total = values.length;
    const average = total
      ? Math.round(values.reduce((sum, value) => sum + value, 0) / total)
      : 0;

    return {
      total,
      average,
      passed: values.filter((value) => value >= 40).length,
      failed: values.filter((value) => value < 40).length,
    };
  }, [marks]);

  function resetAttendanceForm() {
    setAttendanceForm({
      studentId: "",
      subjectId: "",
      date: new Date().toISOString().split("T")[0],
      status: "Present",
    });
    setEditingAttendance(null);
  }

  function resetMarkForm() {
    setMarkForm({
      studentId: "",
      subject: "",
      assessmentType: "Internal",
      marks: "",
    });
    setEditingMark(null);
  }

  async function handleAttendanceSubmit(event) {
    event.preventDefault();

    const { studentId, subjectId, date, status } = attendanceForm;

    if (!studentId || !subjectId || !date) {
      notify("Please select a student, subject and date.", "error");
      return;
    }

    if (!["Present", "Absent"].includes(status)) {
      notify("Status must be Present or Absent.", "error");
      return;
    }

    const token = getToken();
    if (!token) {
      notify("Please login again.", "error");
      return;
    }

    setLoading(true);

    try {
      const isEditing = Boolean(editingAttendance);
      const url = isEditing
        ? `${ATTENDANCE_API_URL}/${editingAttendance.id}`
        : ATTENDANCE_API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId, subjectId, date, status }),
      });

      const result = await response.json();

      if (!response.ok) {
        notify(result.message || "Failed to save attendance.", "error");
        return;
      }

      const saved = result.data;
      if (!saved) {
        notify("The backend did not return the saved attendance.", "error");
        return;
      }

      const record = {
        ...saved,
        id: String(getRecordId(saved, "attendance")),
        studentId: String(saved.studentId ?? studentId),
        subjectId: String(saved.subjectId ?? subjectId),
      };

      if (isEditing) {
        setAttendanceRecords((previous) =>
          previous.map((item) =>
            String(item.id) === String(editingAttendance.id)
              ? record
              : item
          )
        );
        notify("Attendance updated successfully.");
      } else {
        setAttendanceRecords((previous) => [...previous, record]);
        notify("Attendance added successfully.");
      }

      resetAttendanceForm();
      setShowAttendanceModal(false);
    } catch (error) {
      console.error("Attendance save error:", error);
      notify("Unable to connect to attendance backend.", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleEditAttendance(record) {
    setEditingAttendance(record);
    setAttendanceForm({
      studentId: String(record.studentId ?? ""),
      subjectId: String(record.subjectId ?? ""),
      date: String(record.date ?? "").slice(0, 10),
      status: record.status === "Absent" ? "Absent" : "Present",
    });
    setShowAttendanceModal(true);
  }

  async function handleDeleteAttendance(id) {
    if (!window.confirm("Are you sure you want to delete this attendance record?")) {
      return;
    }

    const token = getToken();
    if (!token) {
      notify("Please login again.", "error");
      return;
    }

    try {
      const response = await fetch(
        `${ATTENDANCE_API_URL}/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        notify(result.message || "Failed to delete attendance.", "error");
        return;
      }

      setAttendanceRecords((previous) =>
        previous.filter((record) => String(record.id) !== String(id))
      );
      notify("Attendance record deleted.");
    } catch (error) {
      console.error("Attendance delete error:", error);
      notify("Unable to connect to attendance backend.", "error");
    }
  }

  async function handleMarkSubmit(event) {
    event.preventDefault();

    const { studentId, subject, assessmentType, marks: marksInput } = markForm;

    if (!studentId || !subject || marksInput === "") {
      notify("Please fill in all marks details.", "error");
      return;
    }

    const markValue = Number(marksInput);
    if (!Number.isFinite(markValue) || markValue < 0 || markValue > 100) {
      notify("Marks must be between 0 and 100.", "error");
      return;
    }

    const token = getToken();
    if (!token) {
      notify("Please login again.", "error");
      return;
    }

    setLoading(true);

    try {
      const isEditing = Boolean(editingMark);
      const url = isEditing
        ? `${MARKS_API_URL}/${editingMark.id}`
        : MARKS_API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
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
      });

      const result = await response.json();

      if (!response.ok) {
        notify(result.message || "Failed to save marks.", "error");
        return;
      }

      const saved = result.data;
      if (!saved) {
        notify("The backend did not return the saved marks.", "error");
        return;
      }

      const record = {
        ...saved,
        id: String(getRecordId(saved, "marks")),
        studentId: String(saved.studentId ?? studentId),
      };

      if (isEditing) {
        setMarks((previous) =>
          previous.map((item) =>
            String(item.id) === String(editingMark.id) ? record : item
          )
        );
        notify("Marks updated successfully.");
      } else {
        setMarks((previous) => [...previous, record]);
        notify("Marks added successfully.");
      }

      resetMarkForm();
      setShowMarkModal(false);
    } catch (error) {
      console.error("Marks save error:", error);
      notify("Unable to connect to marks backend.", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleEditMark(mark) {
    setEditingMark(mark);
    setMarkForm({
      studentId: String(mark.studentId ?? ""),
      subject: String(mark.subject ?? ""),
      assessmentType: mark.assessmentType || "Internal",
      marks: String(mark.marks ?? ""),
    });
    setShowMarkModal(true);
  }

  async function handleDeleteMark(id) {
    if (!window.confirm("Are you sure you want to delete this mark?")) {
      return;
    }

    const token = getToken();
    if (!token) {
      notify("Please login again.", "error");
      return;
    }

    try {
      const response = await fetch(
        `${MARKS_API_URL}/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        notify(result.message || "Failed to delete marks.", "error");
        return;
      }

      setMarks((previous) =>
        previous.filter((mark) => String(mark.id) !== String(id))
      );
      notify("Marks deleted successfully.");
    } catch (error) {
      console.error("Marks delete error:", error);
      notify("Unable to connect to marks backend.", "error");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500";

  return (
    <div className="space-y-6">
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
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {activeTab === "attendance" ? "Add Attendance" : "Add Marks"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(activeTab === "attendance"
          ? [
              { label: "Total Records", value: attendanceStats.total },
              { label: "Present", value: attendanceStats.present },
              { label: "Absent", value: attendanceStats.absent },
              { label: "Overall Attendance", value: `${attendanceStats.percentage}%` },
            ]
          : [
              { label: "Total Marks", value: markStats.total },
              { label: "Average", value: markStats.average },
              { label: "Passed", value: markStats.passed },
              { label: "Failed", value: markStats.failed },
            ]
        ).map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("attendance");
                setSearch("");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                activeTab === "attendance"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500"
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
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                activeTab === "marks"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Marks
            </button>
          </div>

          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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

      {activeTab === "attendance" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead className="bg-slate-50">
                <tr className="border-b text-left">
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Student</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Subject</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Date</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center text-sm text-slate-500">
                      <ClipboardCheck size={36} className="mx-auto mb-3 text-slate-300" />
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{getStudentName(record.studentId)}</p>
                        <p className="text-xs text-slate-500">{record.studentId}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {getSubjectName(record.subjectId)}
                        <span className="ml-2 text-xs text-slate-400">
                          {getSubjectCode(record.subjectId)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{record.date}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          record.status === "Present"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => handleEditAttendance(record)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Edit">
                            <Edit3 size={17} />
                          </button>
                          <button type="button" onClick={() => handleDeleteAttendance(record.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Delete">
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

      {activeTab === "marks" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-50">
                <tr className="border-b text-left">
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Student</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Subject</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Assessment</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Marks</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Grade</th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-500">
                      <ClipboardCheck size={36} className="mx-auto mb-3 text-slate-300" />
                      No marks found.
                    </td>
                  </tr>
                ) : (
                  filteredMarks.map((mark) => (
                    <tr key={mark.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{getStudentName(mark.studentId)}</p>
                        <p className="text-xs text-slate-500">{mark.studentId}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">{getSubjectName(mark.subject) === "Unknown Subject" ? mark.subject : getSubjectName(mark.subject)}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{mark.assessmentType || "Internal"}</td>
                      <td className="px-5 py-4 font-bold text-slate-800">{mark.marks}/100</td>
                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">{getGrade(mark.marks)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => handleEditMark(mark)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Edit">
                            <Edit3 size={17} />
                          </button>
                          <button type="button" onClick={() => handleDeleteMark(mark.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Delete">
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

      {showAttendanceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-900">
                  {editingAttendance ? "Edit Attendance" : "Add Attendance"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">Record student attendance.</p>
              </div>
              <button type="button" onClick={() => { resetAttendanceForm(); setShowAttendanceModal(false); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleAttendanceSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Student</label>
                <select required value={attendanceForm.studentId} onChange={(event) => setAttendanceForm({ ...attendanceForm, studentId: event.target.value })} className={inputClass}>
                  <option value="">Select student</option>
                  {normalizedStudents.map((student) => (
                    <option key={student.id} value={student.id}>{student.name} ({student.id})</option>
                  ))}
                </select>
                {normalizedStudents.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">No students available.</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Subject</label>
                <select required value={attendanceForm.subjectId} onChange={(event) => setAttendanceForm({ ...attendanceForm, subjectId: event.target.value })} className={inputClass}>
                  <option value="">Select subject</option>
                  {normalizedSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code ? `${subject.code} - ${subject.name}` : subject.name || subject.id}
                    </option>
                  ))}
                </select>
                {normalizedSubjects.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">No subjects received. Check that the parent component passes the subjects list.</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Date</label>
                <input required type="date" value={attendanceForm.date} onChange={(event) => setAttendanceForm({ ...attendanceForm, date: event.target.value })} className={inputClass} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Status</label>
                <select value={attendanceForm.status} onChange={(event) => setAttendanceForm({ ...attendanceForm, status: event.target.value })} className={inputClass}>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { resetAttendanceForm(); setShowAttendanceModal(false); }} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Saving..." : editingAttendance ? "Update Attendance" : "Save Attendance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMarkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-900">
                  {editingMark ? "Edit Marks" : "Add Marks"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">Enter marks between 0 and 100.</p>
              </div>
              <button type="button" onClick={() => { resetMarkForm(); setShowMarkModal(false); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleMarkSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Student</label>
                <select required value={markForm.studentId} onChange={(event) => setMarkForm({ ...markForm, studentId: event.target.value })} className={inputClass}>
                  <option value="">Select student</option>
                  {normalizedStudents.map((student) => (
                    <option key={student.id} value={student.id}>{student.name} ({student.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Subject</label>
                <select required value={markForm.subject} onChange={(event) => setMarkForm({ ...markForm, subject: event.target.value })} className={inputClass}>
                  <option value="">Select subject</option>
                  {normalizedSubjects.map((subject) => (
                    <option key={subject.id} value={subject.code || subject.id}>
                      {subject.code ? `${subject.code} - ${subject.name}` : subject.name || subject.id}
                    </option>
                  ))}
                </select>
                {normalizedSubjects.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">No subjects received. Check the Subjects module connection.</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Assessment Type</label>
                <select value={markForm.assessmentType} onChange={(event) => setMarkForm({ ...markForm, assessmentType: event.target.value })} className={inputClass}>
                  <option value="Internal">Internal</option>
                  <option value="Mid Term">Mid Term</option>
                  <option value="End Semester">End Semester</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Lab">Lab</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Marks</label>
                <input required type="number" min="0" max="100" step="1" value={markForm.marks} onChange={(event) => setMarkForm({ ...markForm, marks: event.target.value })} placeholder="Enter marks (0-100)" className={inputClass} />
                <p className="mt-1 text-xs text-slate-400">Allowed range: 0 to 100</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { resetMarkForm(); setShowMarkModal(false); }} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Saving..." : editingMark ? "Update Marks" : "Save Marks"}
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