import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin/ScannersPage.css";

export default function ScannersPage() {
  const [scanners, setScanners] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");

  const token = localStorage.getItem("token");

  // 🔹 Fetch scanners
  const fetchScanners = async () => {
    try {
      const res = await axios.get(
        "https://medicore-connect.onrender.com/api/admin/all-users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setScanners(res.data.scanners || []);
    } catch (err) {
      alert("Failed to load scanners");
    }
  };

  useEffect(() => {
    fetchScanners();
  }, []);

  // 🔹 Create scanner
  const createScanner = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://medicore-connect.onrender.com/api/admin/create-scanner",
        { name, email, password, department },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Scanner created successfully");
      setShowModal(false);
      setName("");
      setEmail("");
      setPassword("");
      setDepartment("");
      fetchScanners();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create scanner");
    }
  };

  return (
    <>
      <AdminNavbar />

      <main className="admin-dashboard">
        {/* ================= HEADER ================= */}
        <div className="page-header">
          <h1>Scanners</h1>
          <button
            className="create-btn"
            onClick={() => setShowModal(true)}
          >
            + Create Scanner
          </button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {scanners.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No scanners found
                  </td>
                </tr>
              ) : (
                scanners.map((scanner) => (
                  <tr key={scanner._id}>
                    <td>{scanner.name}</td>
                    <td>{scanner.email}</td>
                    <td>{scanner.department}</td>
                    <td>
                      {new Date(scanner.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Create Scanner</h2>

            <form onSubmit={createScanner}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Create
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
