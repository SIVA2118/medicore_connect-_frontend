import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin/BillersPage.css";

export default function BillersPage() {
  const [billers, setBillers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const token = localStorage.getItem("token");

  // 🔹 Fetch billers
  const fetchBillers = async () => {
    try {
      const res = await axios.get(
        "https://medicore-connect.onrender.com/api/admin/all-users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBillers(res.data.billers || []);
    } catch (err) {
      alert("Failed to load billers");
    }
  };

  useEffect(() => {
    fetchBillers();
  }, []);

  // 🔹 Create biller
  const createBiller = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://medicore-connect.onrender.com/api/admin/create-biller",
        { name, email, password },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Biller created successfully");
      setShowModal(false);
      setName("");
      setEmail("");
      setPassword("");
      fetchBillers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create biller");
    }
  };

  return (
    <>
      <AdminNavbar />

      <main className="admin-dashboard">
        {/* ================= HEADER ================= */}
        <div className="page-header">
          <h1>Billers</h1>
          <button
            className="create-btn"
            onClick={() => setShowModal(true)}
          >
            + Create Biller
          </button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {billers.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No billers found
                  </td>
                </tr>
              ) : (
                billers.map((biller) => (
                  <tr key={biller._id}>
                    <td>{biller.name}</td>
                    <td>{biller.email}</td>
                    <td>
                      {new Date(biller.createdAt).toLocaleDateString()}
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
            <h2>Create Biller</h2>

            <form onSubmit={createBiller}>
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
