import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  Mail,
  Phone,
  BookOpen,
  Users,
} from "lucide-react";

const API_URL = "https://student-information-management-syst-henna.vercel.app/api/faculty";

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("simsToken")}`,
  };
}

function Faculty({
  faculty = [],
  setFaculty,
  subjects = [],
  showToast,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [loading, setLoading] = useState(false);

  const emptyForm = {
    id: "",
    name: "",
    email: "",
    phone: "",
    department: "Information Technology",
    designation: "Assistant Professor",
    subject: "",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchFaculty();
  }, []);

  async function fetchFaculty() {
    const token = localStorage.getItem("simsToken");

    if (!token) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to fetch faculty:", data.message);
        return;
      }

      const mappedFaculty = data.data.map((member) => ({
        ...member,
        id: member.facultyId,
        subject: member.subject || "",
      }));

      setFaculty(mappedFaculty);
    } catch (error) {
      console.error("Unable to connect to faculty backend:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredFaculty = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return faculty;
    }

    return faculty.filter((member) =>
      [
        member.id,
        member.facultyId,
        member.name,
        member.email,
        member.phone,
        member.department,
        member.designation,
        member.subject,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(search)
        )
    );
  }, [faculty, searchTerm]);

  const generateFacultyId = () => {
    let number = faculty.length + 1;

    while (
      faculty.some(
        (member) =>
          member.id === `FAC${String(number).padStart(3, "0")}`
      )
    ) {
      number++;
    }

    return `FAC${String(number).padStart(3, "0")}`;
  };

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const getDesignationClass = (designation = "") => {
    const value = designation.toLowerCase();

    if (value.includes("professor")) {
      return "bg-blue-100 text-blue-700";
    }

    if (value.includes("associate")) {
      return "bg-purple-100 text-purple-700";
    }

    return "bg-green-100 text-green-700";
  };

  function openAddModal() {
    setEditingFaculty(null);

    setForm({
      ...emptyForm,
      id: generateFacultyId(),
    });

    setShowModal(true);
  }

  function openEditModal(member) {
    setEditingFaculty(member);

    setForm({
      id: member.id || member.facultyId || "",
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      department: member.department || "Information Technology",
      designation: member.designation || "Assistant Professor",
      subject: member.subject || "",
    });

    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingFaculty(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.id || !form.name || !form.email || !form.phone) {
      showToast?.("Please fill all required fields.", "error");
      return;
    }

    if (form.name.trim().length < 3) {
      showToast?.("Name must contain at least 3 characters.", "error");
      return;
    }

    if (!form.email.includes("@")) {
      showToast?.("Please enter a valid email address.", "error");
      return;
    }

    if (form.phone.trim().length < 10) {
      showToast?.("Phone number must contain at least 10 digits.", "error");
      return;
    }

    try {
      setLoading(true);

      const body = {
        facultyId: form.id.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        department: form.department,
        designation: form.designation,
        subject: form.subject,
      };

      let response;

      if (editingFaculty) {
        response = await fetch(
          `${API_URL}/${editingFaculty.id}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
          }
        );
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(body),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        showToast?.(
          data.message || "Failed to save faculty.",
          "error"
        );
        return;
      }

      const savedFaculty = {
        ...data.data,
        id: data.data.facultyId,
        subject: form.subject,
      };

      if (editingFaculty) {
        setFaculty((current) =>
          current.map((member) =>
            member.id === editingFaculty.id
              ? savedFaculty
              : member
          )
        );

        showToast?.(
          "Faculty updated successfully.",
          "success"
        );
      } else {
        setFaculty((current) => [
          savedFaculty,
          ...current,
        ]);

        showToast?.(
          "Faculty added successfully.",
          "success"
        );
      }

      closeModal();
    } catch (error) {
      console.error("Faculty save error:", error);

      showToast?.(
        "Unable to connect to the backend.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteFaculty(member) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/${member.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast?.(
          data.message || "Failed to delete faculty.",
          "error"
        );
        return;
      }

      setFaculty((current) =>
        current.filter(
          (item) => item.id !== member.id
        )
      );

      if (
        selectedFaculty &&
        selectedFaculty.id === member.id
      ) {
        setSelectedFaculty(null);
      }

      showToast?.(
        "Faculty deleted successfully.",
        "success"
      );
    } catch (error) {
      console.error("Faculty delete error:", error);

      showToast?.(
        "Unable to connect to the backend.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  const professorCount = faculty.filter(
    (member) =>
      member.designation?.toLowerCase() === "professor"
  ).length;

  const associateProfessorCount = faculty.filter(
    (member) =>
      member.designation
        ?.toLowerCase()
        .includes("associate")
  ).length;

  const assistantProfessorCount = faculty.filter(
    (member) =>
      member.designation
        ?.toLowerCase()
        .includes("assistant")
  ).length;

  const getAssignedSubjects = (member) => {
    const assigned = subjects.filter(
      (subject) => subject.faculty === member.name
    );

    if (assigned.length > 0) {
      return assigned;
    }

    if (member.subject) {
      return [
        {
          name: member.subject,
        },
      ];
    }

    return [];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Faculty
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Add, edit and manage faculty information
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Faculty
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Faculty
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {faculty.length}
              </p>
            </div>

            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <Users size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Professors
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {professorCount}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Associate Professors
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {associateProfessorCount}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Assistant Professors
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {assistantProfessorCount}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search faculty..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <th className="px-6 py-4">
                  Faculty
                </th>

                <th className="px-6 py-4">
                  Faculty ID
                </th>

                <th className="px-6 py-4">
                  Department
                </th>

                <th className="px-6 py-4">
                  Designation
                </th>

                <th className="px-6 py-4">
                  Subject
                </th>

                <th className="px-6 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading && faculty.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Loading faculty...
                  </td>
                </tr>
              ) : filteredFaculty.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No faculty found.
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((member) => {
                  const assignedSubjects =
                    getAssignedSubjects(member);

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                            {getInitials(member.name)}
                          </div>

                          <div>
                            <p className="font-medium text-gray-900">
                              {member.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        {member.id}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {member.department}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getDesignationClass(
                            member.designation
                          )}`}
                        >
                          {member.designation}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {assignedSubjects.length > 0
                          ? assignedSubjects[0].name
                          : member.subject || "Not assigned"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              setSelectedFaculty(member)
                            }
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                            title="View"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            onClick={() =>
                              openEditModal(member)
                            }
                            className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() =>
                              deleteFaculty(member)
                            }
                            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingFaculty
                    ? "Edit Faculty"
                    : "Add Faculty"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter faculty information below
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Faculty ID *
                  </label>

                  <input
                    type="text"
                    value={form.id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        id: e.target.value,
                      })
                    }
                    disabled={!!editingFaculty}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter faculty name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email *
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    placeholder="faculty@example.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Phone *
                  </label>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    placeholder="10 digit phone number"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Department
                  </label>

                  <select
                    value={form.department}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        department: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>
                      Information Technology
                    </option>
                    <option>
                      Computer Science Engineering
                    </option>
                    <option>
                      Electronics and Communication
                    </option>
                    <option>
                      Electrical and Electronics
                    </option>
                    <option>
                      Mechanical Engineering
                    </option>
                    <option>
                      Civil Engineering
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Designation
                  </label>

                  <select
                    value={form.designation}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        designation: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>Professor</option>
                    <option>
                      Associate Professor
                    </option>
                    <option>
                      Assistant Professor
                    </option>
                    <option>Lecturer</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Primary Subject
                  </label>

                  <select
                    value={form.subject}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        subject: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select Subject
                    </option>

                    {subjects.map((subject) => (
                      <option
                        key={
                          subject.id ||
                          subject._id ||
                          subject.name
                        }
                        value={subject.name}
                      >
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Saving..."
                    : editingFaculty
                    ? "Update Faculty"
                    : "Add Faculty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Faculty Profile
                </h2>

                <p className="text-sm text-gray-500">
                  Faculty details
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedFaculty(null)
                }
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                  {getInitials(
                    selectedFaculty.name
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedFaculty.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {selectedFaculty.id}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail
                    size={18}
                    className="text-gray-400"
                  />

                  <div>
                    <p className="text-xs text-gray-500">
                      Email
                    </p>

                    <p className="text-sm text-gray-800">
                      {selectedFaculty.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone
                    size={18}
                    className="text-gray-400"
                  />

                  <div>
                    <p className="text-xs text-gray-500">
                      Phone
                    </p>

                    <p className="text-sm text-gray-800">
                      {selectedFaculty.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users
                    size={18}
                    className="text-gray-400"
                  />

                  <div>
                    <p className="text-xs text-gray-500">
                      Department
                    </p>

                    <p className="text-sm text-gray-800">
                      {selectedFaculty.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <BookOpen
                    size={18}
                    className="text-gray-400"
                  />

                  <div>
                    <p className="text-xs text-gray-500">
                      Designation
                    </p>

                    <p className="text-sm text-gray-800">
                      {selectedFaculty.designation}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Assigned Subjects
                  </p>

                  {getAssignedSubjects(
                    selectedFaculty
                  ).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {getAssignedSubjects(
                        selectedFaculty
                      ).map((subject, index) => (
                        <span
                          key={
                            subject.id ||
                            subject._id ||
                            subject.name ||
                            index
                          }
                          className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                        >
                          {subject.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No subjects assigned.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t p-5">
              <button
                onClick={() =>
                  setSelectedFaculty(null)
                }
                className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Faculty;