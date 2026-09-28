import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  X,
  BookOpen,
  GraduationCap,
  Users,
  Layers,
} from "lucide-react";

const API_URL = "https://student-information-management-syst-henna.vercel.app/api/courses";
const SUBJECT_API_URL = "https://student-information-management-syst-henna.vercel.app/api/subjects";

const emptyCourse = {
  id: "",
  name: "",
  code: "",
  department: "Information Technology",
  duration: "4 Years",
};

const emptySubject = {
  id: "",
  name: "",
  code: "",
  course: "B.Tech IT",
  semester: "1",
  faculty: "",
};

function Courses({
  courses = [],
  setCourses,
  subjects = [],
  setSubjects,
  faculty = [],
  showToast,
}) {
  const [activeTab, setActiveTab] = useState("courses");

  const [courseSearch, setCourseSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");

  const [courseModal, setCourseModal] = useState(false);
  const [subjectModal, setSubjectModal] = useState(false);

  const [editingCourse, setEditingCourse] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);

  const [viewCourse, setViewCourse] = useState(null);

  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [subjectForm, setSubjectForm] = useState(emptySubject);

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  function getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("simsToken")}`,
    };
  }

  useEffect(() => {
    async function fetchCourses() {
      const token = localStorage.getItem("simsToken");

      if (!token) {
        return;
      }

      setLoadingCourses(true);

      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: getHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(
            "Failed to load courses:",
            data.message
          );
          return;
        }

        const mappedCourses = (data.data || []).map(
          (course) => ({
            ...course,
            id: course.courseId,
          })
        );

        setCourses(mappedCourses);
      } catch (error) {
        console.error(
          "Unable to load courses:",
          error
        );
      } finally {
        setLoadingCourses(false);
      }
    }

    fetchCourses();
  }, []);

  useEffect(() => {
    async function fetchSubjects() {
      const token = localStorage.getItem("simsToken");

      if (!token) {
        return;
      }

      setLoadingSubjects(true);

      try {
        const response = await fetch(
          SUBJECT_API_URL,
          {
            method: "GET",
            headers: getHeaders(),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            "Failed to load subjects:",
            data.message
          );
          return;
        }

        const mappedSubjects = (data.data || []).map(
          (subject) => ({
            ...subject,
            id: subject.subjectId,
          })
        );

        setSubjects(mappedSubjects);
      } catch (error) {
        console.error(
          "Unable to load subjects:",
          error
        );
      } finally {
        setLoadingSubjects(false);
      }
    }

    fetchSubjects();
  }, []);

  const filteredCourses = useMemo(() => {
    const value = courseSearch.toLowerCase().trim();

    if (!value) return courses;

    return courses.filter((course) =>
      [
        course.id,
        course.name,
        course.code,
        course.department,
        course.duration,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [courses, courseSearch]);

  const filteredSubjects = useMemo(() => {
    const value = subjectSearch.toLowerCase().trim();

    if (!value) return subjects;

    return subjects.filter((subject) =>
      [
        subject.id,
        subject.name,
        subject.code,
        subject.course,
        subject.semester,
        subject.faculty,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [subjects, subjectSearch]);

  function openAddCourse() {
    setEditingCourse(null);

    setCourseForm({
      ...emptyCourse,
      id: `CRS${String(courses.length + 1).padStart(
        3,
        "0"
      )}`,
    });

    setCourseModal(true);
  }

  function openEditCourse(course) {
    setEditingCourse(course);

    setCourseForm({
      id: course.id || "",
      name: course.name || "",
      code: course.code || "",
      department:
        course.department || "Information Technology",
      duration: course.duration || "4 Years",
    });

    setCourseModal(true);
  }

  function closeCourseModal() {
    setCourseModal(false);
    setEditingCourse(null);
    setCourseForm(emptyCourse);
  }

  function updateCourseField(field, value) {
    setCourseForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function saveCourse(event) {
    event.preventDefault();

    if (
      !courseForm.id.trim() ||
      !courseForm.name.trim() ||
      !courseForm.code.trim()
    ) {
      alert("Please fill all required course fields.");
      return;
    }

    const newCourse = {
      id: courseForm.id.trim(),
      name: courseForm.name.trim(),
      code: courseForm.code.trim().toUpperCase(),
      department: courseForm.department,
      duration: courseForm.duration,
    };

    const token = localStorage.getItem("simsToken");

    if (!token) {
      showToast?.("Please login again.", "error");
      return;
    }

    if (editingCourse) {
      try {
        const response = await fetch(
          `${API_URL}/${editingCourse.id}`,
          {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({
              courseId: newCourse.id,
              name: newCourse.name,
              code: newCourse.code,
              department: newCourse.department,
              duration: newCourse.duration,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          showToast?.(
            data.message || "Failed to update course.",
            "error"
          );
          return;
        }

        const updatedCourse = {
          ...data.data,
          id: data.data.courseId,
        };

        setCourses((previous) =>
          previous.map((course) =>
            course.id === editingCourse.id
              ? updatedCourse
              : course
          )
        );

        if (
          viewCourse &&
          viewCourse.id === editingCourse.id
        ) {
          setViewCourse(updatedCourse);
        }

        showToast?.("Course updated successfully.");
        closeCourseModal();
      } catch (error) {
        console.error("Course update error:", error);

        showToast?.(
          "Unable to connect to course backend.",
          "error"
        );
      }

      return;
    }

    const exists = courses.some(
      (course) =>
        course.id?.toLowerCase() ===
          newCourse.id.toLowerCase() ||
        course.code?.toLowerCase() ===
          newCourse.code.toLowerCase()
    );

    if (exists) {
      alert("Course ID or course code already exists.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          courseId: newCourse.id,
          name: newCourse.name,
          code: newCourse.code,
          department: newCourse.department,
          duration: newCourse.duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast?.(
          data.message || "Failed to add course.",
          "error"
        );
        return;
      }

      const createdCourse = {
        ...data.data,
        id: data.data.courseId,
      };

      setCourses((previous) => [
        ...previous,
        createdCourse,
      ]);

      showToast?.("Course added successfully.");
      closeCourseModal();
    } catch (error) {
      console.error("Course creation error:", error);

      showToast?.(
        "Unable to connect to course backend.",
        "error"
      );
    }
  }

  async function deleteCourse(course) {
    const linkedSubjects = subjects.filter(
      (subject) =>
        subject.course === course.code ||
        subject.course === course.name ||
        subject.course === `B.Tech ${course.code}`
    );

    if (linkedSubjects.length > 0) {
      const shouldContinue = window.confirm(
        `${linkedSubjects.length} subject(s) are linked to this course.\n\nDelete the course and its linked subjects?`
      );

      if (!shouldContinue) return;

      for (const subject of linkedSubjects) {
        try {
          await fetch(
            `${SUBJECT_API_URL}/${subject.id}`,
            {
              method: "DELETE",
              headers: getHeaders(),
            }
          );
        } catch (error) {
          console.error(
            "Linked subject delete error:",
            error
          );
        }
      }

      setSubjects((previous) =>
        previous.filter(
          (subject) =>
            subject.course !== course.code &&
            subject.course !== course.name &&
            subject.course !==
              `B.Tech ${course.code}`
        )
      );
    } else {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${course.name}?`
      );

      if (!confirmed) return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${course.id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast?.(
          data.message || "Failed to delete course.",
          "error"
        );
        return;
      }

      setCourses((previous) =>
        previous.filter(
          (item) => item.id !== course.id
        )
      );

      if (viewCourse?.id === course.id) {
        setViewCourse(null);
      }

      showToast?.("Course deleted successfully.");
    } catch (error) {
      console.error("Course delete error:", error);

      showToast?.(
        "Unable to connect to course backend.",
        "error"
      );
    }
  }

  function openAddSubject() {
    setEditingSubject(null);

    setSubjectForm({
      ...emptySubject,
      id: `SUB${String(subjects.length + 1).padStart(
        3,
        "0"
      )}`,
      course:
        courses.length > 0
          ? `B.Tech ${courses[0].code}`
          : "B.Tech IT",
      faculty:
        faculty.length > 0
          ? faculty[0].name
          : "",
    });

    setSubjectModal(true);
  }

  function openEditSubject(subject) {
    setEditingSubject(subject);

    setSubjectForm({
      id: subject.id || "",
      name: subject.name || "",
      code: subject.code || "",
      course: subject.course || "B.Tech IT",
      semester: subject.semester || "1",
      faculty: subject.faculty || "",
    });

    setSubjectModal(true);
  }

  function closeSubjectModal() {
    setSubjectModal(false);
    setEditingSubject(null);
    setSubjectForm(emptySubject);
  }

  function updateSubjectField(field, value) {
    setSubjectForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function saveSubject(event) {
    event.preventDefault();

    if (
      !subjectForm.id.trim() ||
      !subjectForm.name.trim() ||
      !subjectForm.code.trim() ||
      !subjectForm.course
    ) {
      alert("Please fill all required subject fields.");
      return;
    }

    const token = localStorage.getItem("simsToken");

    if (!token) {
      showToast?.("Please login again.", "error");
      return;
    }

    const subjectData = {
      subjectId: subjectForm.id.trim(),
      name: subjectForm.name.trim(),
      code: subjectForm.code.trim().toUpperCase(),
      course: subjectForm.course,
      semester: subjectForm.semester,
      faculty: subjectForm.faculty,
    };

    try {
      if (editingSubject) {
        const response = await fetch(
          `${SUBJECT_API_URL}/${editingSubject.id}`,
          {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(subjectData),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          showToast?.(
            data.message ||
              "Failed to update subject.",
            "error"
          );
          return;
        }

        const updatedSubject = {
          ...data.data,
          id: data.data.subjectId,
        };

        setSubjects((previous) =>
          previous.map((subject) =>
            subject.id === editingSubject.id
              ? updatedSubject
              : subject
          )
        );

        showToast?.("Subject updated successfully.");
        closeSubjectModal();

        return;
      }

      const exists = subjects.some(
        (subject) =>
          subject.id?.toLowerCase() ===
          subjectData.subjectId.toLowerCase()
      );

      if (exists) {
        alert("Subject ID already exists.");
        return;
      }

      const response = await fetch(
        SUBJECT_API_URL,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(subjectData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast?.(
          data.message ||
            "Failed to add subject.",
          "error"
        );
        return;
      }

      const createdSubject = {
        ...data.data,
        id: data.data.subjectId,
      };

      setSubjects((previous) => [
        ...previous,
        createdSubject,
      ]);

      showToast?.("Subject added successfully.");
      closeSubjectModal();
    } catch (error) {
      console.error("Subject save error:", error);

      showToast?.(
        "Unable to connect to subject backend.",
        "error"
      );
    }
  }

  async function deleteSubject(subject) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${subject.name}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${SUBJECT_API_URL}/${subject.id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast?.(
          data.message ||
            "Failed to delete subject.",
          "error"
        );
        return;
      }

      setSubjects((previous) =>
        previous.filter(
          (item) => item.id !== subject.id
        )
      );

      showToast?.("Subject deleted successfully.");
    } catch (error) {
      console.error("Subject delete error:", error);

      showToast?.(
        "Unable to connect to subject backend.",
        "error"
      );
    }
  }

  function getCourseSubjects(course) {
    return subjects.filter(
      (subject) =>
        subject.course === course.code ||
        subject.course === course.name ||
        subject.course === `B.Tech ${course.code}`
    );
  }

  return (
    <div className="page-section">
      <div className="page-title-row">
        <div>
          <h1>Courses & Subjects</h1>
          <p>
            Manage academic courses, subjects, semesters and
            faculty assignments.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={
            activeTab === "courses"
              ? openAddCourse
              : openAddSubject
          }
        >
          <Plus size={18} />

          {activeTab === "courses"
            ? "Add Course"
            : "Add Subject"}
        </button>
      </div>

      <div className="course-summary-grid">
        <div className="course-summary-card">
          <div className="course-summary-icon blue">
            <BookOpen size={22} />
          </div>

          <div>
            <span>Total Courses</span>
            <strong>{courses.length}</strong>
          </div>
        </div>

        <div className="course-summary-card">
          <div className="course-summary-icon purple">
            <Layers size={22} />
          </div>

          <div>
            <span>Total Subjects</span>
            <strong>{subjects.length}</strong>
          </div>
        </div>

        <div className="course-summary-card">
          <div className="course-summary-icon green">
            <GraduationCap size={22} />
          </div>

          <div>
            <span>Faculty Assigned</span>

            <strong>
              {
                subjects.filter(
                  (subject) => subject.faculty
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="course-summary-card">
          <div className="course-summary-icon orange">
            <Users size={22} />
          </div>

          <div>
            <span>Academic Structure</span>

            <strong>
              {courses.length + subjects.length}
            </strong>
          </div>
        </div>
      </div>

      <div className="academic-tabs">
        <button
          className={
            activeTab === "courses"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("courses")
          }
        >
          <BookOpen size={17} />

          Courses

          <span>{courses.length}</span>
        </button>

        <button
          className={
            activeTab === "subjects"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("subjects")
          }
        >
          <Layers size={17} />

          Subjects

          <span>{subjects.length}</span>
        </button>
      </div>

      {activeTab === "courses" && (
        <div className="table-card">
          <div className="table-toolbar">
            <div>
              <h2>Academic Courses</h2>

              <p>
                {loadingCourses
                  ? "Loading courses..."
                  : `${filteredCourses.length} course(s) found`}
              </p>
            </div>

            <div className="search-box">
              <Search size={18} />

              <input
                value={courseSearch}
                onChange={(event) =>
                  setCourseSearch(
                    event.target.value
                  )
                }
                placeholder="Search courses..."
              />

              {courseSearch && (
                <button
                  className="search-clear"
                  onClick={() =>
                    setCourseSearch("")
                  }
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Code</th>
                  <th>Department</th>
                  <th>Duration</th>
                  <th>Subjects</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loadingCourses ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                      }}
                    >
                      Loading courses...
                    </td>
                  </tr>
                ) : filteredCourses.length ===
                  0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="table-empty-state">
                        <BookOpen size={42} />

                        <h3>No courses found</h3>

                        <p>
                          Add a course or change
                          your search.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map(
                    (course) => {
                      const courseSubjects =
                        getCourseSubjects(
                          course
                        );

                      return (
                        <tr key={course.id}>
                          <td>
                            <div className="course-name-cell">
                              <div className="course-icon">
                                <BookOpen size={18} />
                              </div>

                              <div>
                                <strong>
                                  {course.name}
                                </strong>

                                <small>
                                  {course.id}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="code-badge">
                              {course.code}
                            </span>
                          </td>

                          <td>
                            <span className="department-badge">
                              {course.department}
                            </span>
                          </td>

                          <td>
                            {course.duration}
                          </td>

                          <td>
                            <span className="count-badge">
                              {
                                courseSubjects.length
                              }{" "}
                              Subjects
                            </span>
                          </td>

                          <td>
                            <div className="action-buttons">
                              <button
                                className="icon-btn view"
                                title="View Course"
                                onClick={() =>
                                  setViewCourse(
                                    course
                                  )
                                }
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                className="icon-btn edit"
                                title="Edit Course"
                                onClick={() =>
                                  openEditCourse(
                                    course
                                  )
                                }
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                className="icon-btn delete"
                                title="Delete Course"
                                onClick={() =>
                                  deleteCourse(
                                    course
                                  )
                                }
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "subjects" && (
        <div className="table-card">
          <div className="table-toolbar">
            <div>
              <h2>Subjects</h2>

              <p>
                {loadingSubjects
                  ? "Loading subjects..."
                  : `${filteredSubjects.length} subject(s) found`}
              </p>
            </div>

            <div className="search-box">
              <Search size={18} />

              <input
                value={subjectSearch}
                onChange={(event) =>
                  setSubjectSearch(
                    event.target.value
                  )
                }
                placeholder="Search subjects..."
              />

              {subjectSearch && (
                <button
                  className="search-clear"
                  onClick={() =>
                    setSubjectSearch("")
                  }
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Faculty</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loadingSubjects ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                      }}
                    >
                      Loading subjects...
                    </td>
                  </tr>
                ) : filteredSubjects.length ===
                  0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="table-empty-state">
                        <Layers size={42} />

                        <h3>No subjects found</h3>

                        <p>
                          Add a subject or change
                          your search.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map(
                    (subject) => (
                      <tr key={subject.id}>
                        <td>
                          <div className="subject-name-cell">
                            <div className="subject-icon">
                              <BookOpen size={17} />
                            </div>

                            <div>
                              <strong>
                                {subject.name}
                              </strong>

                              <small>
                                {subject.id}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="code-badge purple">
                            {subject.code}
                          </span>
                        </td>

                        <td>
                          <span className="course-badge">
                            {subject.course}
                          </span>
                        </td>

                        <td>
                          <span className="semester-badge">
                            Semester{" "}
                            {subject.semester}
                          </span>
                        </td>

                        <td>
                          <div className="faculty-mini">
                            <div className="mini-avatar">
                              {subject.faculty
                                ? subject.faculty
                                    .split(
                                      " "
                                    )
                                    .map(
                                      (
                                        word
                                      ) =>
                                        word[0]
                                    )
                                    .slice(
                                      0,
                                      2
                                    )
                                    .join("")
                                : "NA"}
                            </div>

                            <span>
                              {subject.faculty ||
                                "Not assigned"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="icon-btn edit"
                              title="Edit Subject"
                              onClick={() =>
                                openEditSubject(
                                  subject
                                )
                              }
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              className="icon-btn delete"
                              title="Delete Subject"
                              onClick={() =>
                                deleteSubject(
                                  subject
                                )
                              }
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {courseModal && (
        <div className="modal-overlay">
          <div className="modal academic-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingCourse
                    ? "Edit Course"
                    : "Add Course"}
                </h2>

                <p>
                  Enter academic course
                  information.
                </p>
              </div>

              <button
                className="close-btn"
                onClick={closeCourseModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveCourse}>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Course ID *
                  </label>

                  <input
                    value={courseForm.id}
                    disabled={!!editingCourse}
                    onChange={(event) =>
                      updateCourseField(
                        "id",
                        event.target.value
                      )
                    }
                    placeholder="CRS005"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Course Name *
                  </label>

                  <input
                    value={courseForm.name}
                    onChange={(event) =>
                      updateCourseField(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="B.Tech Information Technology"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Course Code *
                  </label>

                  <input
                    value={courseForm.code}
                    onChange={(event) =>
                      updateCourseField(
                        "code",
                        event.target.value
                      )
                    }
                    placeholder="IT"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Department
                  </label>

                  <select
                    value={
                      courseForm.department
                    }
                    onChange={(event) =>
                      updateCourseField(
                        "department",
                        event.target.value
                      )
                    }
                  >
                    <option>
                      Information Technology
                    </option>
                    <option>
                      Computer Science
                    </option>
                    <option>
                      Electronics
                    </option>
                    <option>
                      Mechanical
                    </option>
                    <option>
                      Civil
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Duration
                  </label>

                  <select
                    value={
                      courseForm.duration
                    }
                    onChange={(event) =>
                      updateCourseField(
                        "duration",
                        event.target.value
                      )
                    }
                  >
                    <option>
                      4 Years
                    </option>
                    <option>
                      3 Years
                    </option>
                    <option>
                      2 Years
                    </option>
                    <option>
                      1 Year
                    </option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={
                    closeCourseModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  {editingCourse
                    ? "Update Course"
                    : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {subjectModal && (
        <div className="modal-overlay">
          <div className="modal academic-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingSubject
                    ? "Edit Subject"
                    : "Add Subject"}
                </h2>

                <p>
                  Add a subject and assign it
                  to a course and faculty.
                </p>
              </div>

              <button
                className="close-btn"
                onClick={
                  closeSubjectModal
                }
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveSubject}>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Subject ID *
                  </label>

                  <input
                    value={subjectForm.id}
                    disabled={
                      !!editingSubject
                    }
                    onChange={(event) =>
                      updateSubjectField(
                        "id",
                        event.target.value
                      )
                    }
                    placeholder="SUB005"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Subject Name *
                  </label>

                  <input
                    value={
                      subjectForm.name
                    }
                    onChange={(event) =>
                      updateSubjectField(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Operating Systems"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Subject Code *
                  </label>

                  <input
                    value={
                      subjectForm.code
                    }
                    onChange={(event) =>
                      updateSubjectField(
                        "code",
                        event.target.value
                      )
                    }
                    placeholder="OS"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Course *
                  </label>

                  <select
                    value={
                      subjectForm.course
                    }
                    onChange={(event) =>
                      updateSubjectField(
                        "course",
                        event.target.value
                      )
                    }
                  >
                    {courses.length > 0 ? (
                      courses.map(
                        (course) => (
                          <option
                            key={course.id}
                            value={`B.Tech ${course.code}`}
                          >
                            {`B.Tech ${course.code}`}
                          </option>
                        )
                      )
                    ) : (
                      <option>
                        B.Tech IT
                      </option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Semester
                  </label>

                  <select
                    value={
                      subjectForm.semester
                    }
                    onChange={(event) =>
                      updateSubjectField(
                        "semester",
                        event.target.value
                      )
                    }
                  >
                    <option value="1">
                      1
                    </option>
                    <option value="2">
                      2
                    </option>
                    <option value="3">
                      3
                    </option>
                    <option value="4">
                      4
                    </option>
                    <option value="5">
                      5
                    </option>
                    <option value="6">
                      6
                    </option>
                    <option value="7">
                      7
                    </option>
                    <option value="8">
                      8
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Faculty
                  </label>

                  <select
                    value={
                      subjectForm.faculty
                    }
                    onChange={(event) =>
                      updateSubjectField(
                        "faculty",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Not Assigned
                    </option>

                    {faculty.map(
                      (member) => (
                        <option
                          key={member.id}
                          value={member.name}
                        >
                          {member.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={
                    closeSubjectModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  {editingSubject
                    ? "Update Subject"
                    : "Add Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewCourse && (
        <div className="modal-overlay">
          <div className="modal course-profile-modal">
            <div className="course-profile-header">
              <button
                className="close-btn"
                onClick={() =>
                  setViewCourse(null)
                }
              >
                <X size={20} />
              </button>

              <div className="large-course-icon">
                <BookOpen size={30} />
              </div>

              <h2>
                {viewCourse.name}
              </h2>

              <p>
                {viewCourse.department}
              </p>

              <span className="course-main-code">
                {viewCourse.code}
              </span>
            </div>

            <div className="course-profile-body">
              <div className="course-detail-grid">
                <div>
                  <span>
                    Course ID
                  </span>

                  <strong>
                    {viewCourse.id}
                  </strong>
                </div>

                <div>
                  <span>
                    Course Code
                  </span>

                  <strong>
                    {viewCourse.code}
                  </strong>
                </div>

                <div>
                  <span>
                    Department
                  </span>

                  <strong>
                    {
                      viewCourse.department
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Duration
                  </span>

                  <strong>
                    {
                      viewCourse.duration
                    }
                  </strong>
                </div>
              </div>

              <div className="course-subject-heading">
                <Layers size={18} />

                <h3>
                  Subjects in this Course
                </h3>
              </div>

              <div className="course-subject-list">
                {getCourseSubjects(
                  viewCourse
                ).length > 0 ? (
                  getCourseSubjects(
                    viewCourse
                  ).map((subject) => (
                    <div
                      className="course-subject-item"
                      key={subject.id}
                    >
                      <div>
                        <strong>
                          {
                            subject.name
                          }
                        </strong>

                        <span>
                          {
                            subject.code
                          }{" "}
                          • Semester{" "}
                          {
                            subject.semester
                          }
                        </span>
                      </div>

                      <span className="course-subject-faculty">
                        {subject.faculty ||
                          "Not assigned"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="course-no-subject">
                    <Layers size={25} />

                    <p>
                      No subjects are
                      currently assigned
                      to this course.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="course-profile-footer">
              <button
                className="secondary-btn"
                onClick={() =>
                  setViewCourse(null)
                }
              >
                Close
              </button>

              <button
                className="primary-btn"
                onClick={() => {
                  setViewCourse(null);
                  openEditCourse(
                    viewCourse
                  );
                }}
              >
                <Pencil size={17} />
                Edit Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;