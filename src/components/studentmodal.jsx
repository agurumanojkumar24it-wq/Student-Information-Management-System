import { useEffect, useState } from "react";
import { X } from "lucide-react";

const emptyStudent = {
  id: "",
  name: "",
  email: "",
  phone: "",
  department: "Information Technology",
  course: "B.Tech IT",
  year: "1st Year",
  section: "A",
  attendance: 0,
};

function StudentModal({ student, onClose, onSave }) {
  const [form, setForm] = useState(emptyStudent);

  useEffect(() => {
    setForm(
      student
        ? { ...student }
        : { ...emptyStudent }
    );
  }, [student]);

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.id.trim() ||
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    onSave({
      ...form,
      id: form.id.trim(),
      name: form.name.trim(),
    });
  }

  return (
    <div className="modal-overlay">

      <div className="modal">

        <div className="modal-header">

          <div>
            <h2>
              {student
                ? "Edit Student"
                : "Add Student"}
            </h2>

            <p>
              Enter student information below.
            </p>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>

        </div>

        <form
          className="student-form"
          onSubmit={handleSubmit}
        >

          <div className="form-grid">

            <div className="form-group">
              <label>Student ID *</label>

              <input
                value={form.id}
                disabled={!!student}
                onChange={(event) =>
                  updateField(
                    "id",
                    event.target.value
                  )
                }
                placeholder="STU006"
              />
            </div>

            <div className="form-group">
              <label>Full Name *</label>

              <input
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Student name"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>

              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="student@gmail.com"
              />
            </div>

            <div className="form-group">
              <label>Phone *</label>

              <input
                value={form.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value
                  )
                }
                placeholder="9876543210"
              />
            </div>

            <div className="form-group">
              <label>Department</label>

              <select
                value={form.department}
                onChange={(event) =>
                  updateField(
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
              <label>Course</label>

              <select
                value={form.course}
                onChange={(event) =>
                  updateField(
                    "course",
                    event.target.value
                  )
                }
              >
                <option>B.Tech IT</option>
                <option>B.Tech CSE</option>
                <option>B.Tech ECE</option>
                <option>B.Tech ME</option>
              </select>
            </div>

            <div className="form-group">
              <label>Year</label>

              <select
                value={form.year}
                onChange={(event) =>
                  updateField(
                    "year",
                    event.target.value
                  )
                }
              >
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>

            <div className="form-group">
              <label>Section</label>

              <select
                value={form.section}
                onChange={(event) =>
                  updateField(
                    "section",
                    event.target.value
                  )
                }
              >
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </div>

          </div>

          <div className="modal-actions">

            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
            >
              {student
                ? "Update Student"
                : "Add Student"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default StudentModal;