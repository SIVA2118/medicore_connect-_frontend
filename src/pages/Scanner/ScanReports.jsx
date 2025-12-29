import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import ScannerNavbar from "../../components/ScannerNavbar";
import "../../styles/Scanner/ScanReports.css";

export default function ScanReports() {
    const [reports, setReports] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Hook

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("https://medicore-connect.onrender.com/api/scanner/scan-reports", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setReports(res.data.reports);
            }
        } catch (err) {
            console.error("Failed to fetch reports", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r =>
        r.scanName.toLowerCase().includes(search.toLowerCase()) ||
        r.patient?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDeleteReport = async (reportId) => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`https://medicore-connect.onrender.com/api/scanner/scan-report/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(reports.filter(r => r._id !== reportId));
            alert("Report deleted");
        } catch (err) {
            console.error("Failed to delete report", err);
            alert("Failed to delete report");
        }
    };

    return (
        <>
            <ScannerNavbar />
            <div className="list-container">
                <div className="list-header">
                    <h2>All Scan Reports</h2>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search by Scan Name or Patient..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-bar"
                        />
                    </div>
                </div>

                {loading ? <p>Loading reports...</p> : (
                    <div className="reports-grid">
                        {filteredReports.map(r => (
                            <div
                                className="report-card"
                                key={r._id}
                                onClick={() => {
                                    if (r.isVerified) {
                                        navigate(`/scanner/scan-report/view/${r._id}`);
                                    } else {
                                        navigate("/scanner/create-report", { state: { report: r } });
                                    }
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="card-header">
                                    <span className="scan-type">{r.type}</span>
                                    <span className={`status-badge ${r.isVerified ? 'verified' : 'pending'}`}>
                                        {r.isVerified ? "Verified" : "Pending"}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <h3>{r.scanName}</h3>
                                    <div className="card-info-row">
                                        <div className="person-info">
                                            {r.patient?.profileImage ? <img src={r.patient.profileImage} alt="" className="avatar-small" /> : <span className="avatar-placeholder">👤</span>}
                                            <span className="patient-name">{r.patient?.name || "Unknown"}</span>
                                        </div>
                                        <div className="person-info">
                                            {r.doctor?.profileImage ? <img src={r.doctor.profileImage} alt="" className="avatar-small" /> : <span className="avatar-placeholder">👨‍⚕️</span>}
                                            <span className="doctor-name">Dr. {r.doctor?.name || "Unassigned"}</span>
                                        </div>
                                    </div>
                                    <p className="date" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>📅 {new Date(r.scanDate).toLocaleDateString()}</p>
                                </div>
                                <div className="card-footer">
                                    <button
                                        className="btn-process"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (r.isVerified) {
                                                navigate(`/scanner/scan-report/view/${r._id}`);
                                            } else {
                                                navigate("/scanner/create-report", { state: { report: r } });
                                            }
                                        }}
                                    >
                                        {r.isVerified ? "View Report" : "Process Report"}
                                    </button>
                                    {!r.isVerified && (
                                        <button
                                            className="btn-delete-card"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteReport(r._id);
                                            }}
                                            title="Delete Report"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style>{`
                .list-header {
                    margin-bottom: 2rem;
                }
                .search-container {
                    max-width: 500px;
                }
                .search-bar {
                    width: 100%;
                    padding: 0.85rem 1.25rem;
                    border: 2px solid #f1f5f9;
                    border-radius: 12px;
                    background: white;
                    font-size: 1rem;
                    transition: all 0.2s;
                }
                .search-bar:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }
                .reports-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 2rem;
                }
                .report-card {
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }
                .report-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
                }
                .card-header {
                    padding: 1.25rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .scan-type {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #64748b;
                    background: #f8fafc;
                    padding: 0.4rem 0.8rem;
                    border-radius: 30px;
                }
                .status-badge {
                    padding: 0.35rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                }
                .status-badge.pending { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
                .status-badge.verified { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }
                .card-body {
                    padding: 0 1.25rem 1.25rem 1.25rem;
                    flex: 1;
                }
                .card-body h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 1rem;
                }
                .card-info-row {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .person-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .avatar-small {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: 2px solid #fff;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .avatar-placeholder {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #f1f5f9;
                    display: grid;
                    place-items: center;
                    font-size: 0.9rem;
                }
                .patient-name { font-weight: 600; color: #334155; }
                .doctor-name { font-size: 0.9rem; color: #64748b; }
                .card-footer {
                    padding: 1.25rem;
                    background: #fcfcfc;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    gap: 0.75rem;
                }
                .btn-process {
                    flex: 1;
                    height: 42px;
                    background: #0f172a;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-process:hover { background: #334155; }
                .btn-delete-card {
                    width: 42px;
                    height: 42px;
                    background: #fee2e2;
                    color: #dc2626;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    display: grid;
                    place-items: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-delete-card:hover {
                    background: #dc2626;
                    color: white;
                    border-color: #dc2626;
                }
            `}</style>
        </>
    );
}
