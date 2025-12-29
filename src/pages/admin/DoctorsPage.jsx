import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin/DoctorsPage.css";

export default function DoctorsPage() {
  const token = localStorage.getItem("token");
  const [doctors, setDoctors] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    phone: "",
    gender: "",
    age: "",
    experience: "",
    qualification: "",
    registrationNumber: "",
    clinicAddress: "",
    consultationFee: "",
    bio: "",
    profileImage: "",
    availability: { days: [], from: "", to: "" },
  });

  // ================= FETCH DOCTORS =================
  const fetchDoctors = async () => {
    const res = await axios.get(
      "https://medicore-connect.onrender.com/api/admin/all-users",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setDoctors(res.data.doctors || []);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // ================= HANDLERS =================
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvailability = (e) =>
    setForm({
      ...form,
      availability: {
        ...form.availability,
        [e.target.name]: e.target.value,
      },
    });

  const toggleDay = (day) => {
    const days = form.availability.days.includes(day)
      ? form.availability.days.filter((d) => d !== day)
      : [...form.availability.days, day];

    setForm({ ...form, availability: { ...form.availability, days } });
  };

  // ================= CREATE DOCTOR =================
  const createDoctor = async (e) => {
    e.preventDefault();

    await axios.post(
      "https://medicore-connect.onrender.com/api/admin/create-doctor",
      {
        ...form,
        age: Number(form.age),
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Doctor created successfully");
    fetchDoctors();
  };

  return (
    <>
      <AdminNavbar />

      <main className="admin-dashboard">
        <h1>Doctors</h1>

        <div className="page-grid">

          {/* ================= CREATE DOCTOR ================= */}
          <form className="card" onSubmit={createDoctor}>
            <h3>Add Doctor</h3>

            <div className="card-scroll form-grid">
              <input name="name" placeholder="Doctor Name" onChange={handleChange} required />
              <input name="email" placeholder="Email" onChange={handleChange} required />
              <input name="password" type="password" placeholder="Password" onChange={handleChange} required />

              <select name="gender" onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>

              <select name="specialization" onChange={handleChange} required>
                <option value="">Select Specialization</option>
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Orthopedics</option>
                <option>Dermatology</option>
                <option>Pediatrics</option>
                <option>General Medicine</option>
              </select>

              <input name="phone" placeholder="Phone" onChange={handleChange} />
              <input name="age" type="number" placeholder="Age" onChange={handleChange} />
              <input name="experience" type="number" placeholder="Experience (Years)" onChange={handleChange} />
              <input name="qualification" placeholder="Qualification" onChange={handleChange} />
              <input name="registrationNumber" placeholder="Registration Number" onChange={handleChange} />
              <input name="clinicAddress" placeholder="Clinic Address" onChange={handleChange} />
              <input name="consultationFee" type="number" placeholder="Consultation Fee" onChange={handleChange} />
              <input name="profileImage" placeholder="Profile Image URL" onChange={handleChange} />

              <textarea name="bio" placeholder="Doctor Bio" onChange={handleChange}></textarea>

              <div className="availability">
                <strong>Available Days</strong>
                <div className="days">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <label key={d}>
                      <input type="checkbox" onChange={() => toggleDay(d)} /> {d}
                    </label>
                  ))}
                </div>
              </div>

              <input type="time" name="from" onChange={handleAvailability} />
              <input type="time" name="to" onChange={handleAvailability} />

              <button type="submit">Create Doctor</button>
            </div>
          </form>

          {/* ================= DOCTOR LIST ================= */}
          <div className="card">
            <h3>Doctor List</h3>

            <div className="card-scroll">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Specialization</th>
                      <th>Phone</th>
                      <th>Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((d) => (
                      <tr key={d._id}>
                        <td>{d.name}</td>
                        <td>{d.specialization}</td>
                        <td>{d.phone}</td>
                        <td>₹{d.consultationFee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
