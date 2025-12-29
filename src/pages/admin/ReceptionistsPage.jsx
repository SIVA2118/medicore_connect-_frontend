import { useEffect, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin/ReceptionistsPage.css";
import axios from "axios";

export default function ReceptionistsPage() {
  const [receptionists, setReceptionists] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const token = localStorage.getItem("token");

  // 🔹 Fetch receptionists
  const fetchReceptionists = async () => {
    try {
      const res = await axios.get(
        "https://medicore-connect.onrender.com/api/admin/all-users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReceptionists(res.data.receptionists || []);
    } catch (err) {
      alert("Failed to load receptionists");
    }
  };

  useEffect(() => {
    fetchReceptionists();
  }, []);

  // 🔹 Create receptionist
  const createReceptionist = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://medicore-connect.onrender.com/api/admin/create-receptionist",
        { name, email, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setName("");
      setEmail("");
      setPassword("");
      setShowModal(false);
      fetchReceptionists();
      alert("Receptionist created successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Creation failed");
    }
  };

  return (
    <>
      <AdminNavbar />

      <main className="admin-dashboard">
        {/* HEADER */}
        <div className="page-header">
          <h1>Receptionists</h1>
          <button className="create-btn" onClick={() => setShowModal(true)}>
            + Create
          </button>
        </div>

        {/* TABLE */}
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>

            <tbody>
              {receptionists.map((r) => (
                <tr key={r._id}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <form className="modal-card" onSubmit={createReceptionist}>
            <h3>Add Receptionist</h3>

            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="save-btn">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
