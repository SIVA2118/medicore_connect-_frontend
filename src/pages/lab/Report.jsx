import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import LabNavbar from "../../components/LabNavbar";
import "../../styles/lab/Report.css";

export default function Report() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("https://medicore-connect.onrender.com/api/lab/reports", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setReports(res.data.reports || []);
            }
        } catch (err) {
            console.error("Failed to fetch reports", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                alert("Session expired or invalid. Please logout and login again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r =>
        (r.patient?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (r.testName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <LabNavbar />
            <div className="lab-report-container">
                <div className="lab-header-actions">
                    <h2>All Lab Reports</h2>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search by Patient or Test..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-bar"
                        />
                    </div>
                </div>

                {loading ? <p>Loading reports...</p> : (
                    <div className="reports-grid">
                        {filteredReports.map(report => (
                            <div className="report-card" key={report._id}>
                                <div className="card-header">
                                    <span className="scan-type">{report.testType}</span>
                                    <span className={`status-badge ${report.resultStatus?.toLowerCase() === 'normal' ? 'verified' : report.resultStatus?.toLowerCase() === 'critical' ? 'critical' : 'pending'}`}>
                                        {report.resultStatus || 'Pending'}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <h3>{report.testName}</h3>
                                    <div className="card-info-row">
                                        <div className="person-info">
                                            {report.patient?.profileImage ? (
                                                <img src={report.patient.profileImage} alt="" className="avatar-small" />
                                            ) : (
                                                <span className="avatar-placeholder">👤</span>
                                            )}
                                            <span className="patient-name">{report.patient?.name || "Unknown"}</span>
                                        </div>
                                        <div className="person-info">
                                            {report.doctor?.profileImage ? (
                                                <img src={report.doctor.profileImage} alt="" className="avatar-small" />
                                            ) : (
                                                <span className="avatar-placeholder">👨‍⚕️</span>
                                            )}
                                            <span className="doctor-name">Dr. {report.doctor?.name || "Unassigned"}</span>
                                        </div>
                                    </div>
                                    <p className="date" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                        📅 {new Date(report.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="card-footer">
                                    {report.isVerified ? (
                                        <Link to={`/lab/report/view/${report._id}`} className="btn-process">
                                            View Report
                                        </Link>
                                    ) : (
                                        <button
                                            className="btn-process"
                                            onClick={() => navigate("/lab/create-report", { state: { report } })}
                                        >
                                            Process Report
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredReports.length === 0 && <p>No reports found.</p>}
                    </div>
                )}
            </div>
        </>
    );
}
