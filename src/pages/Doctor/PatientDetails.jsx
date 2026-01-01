import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/Doctor/PatientDetails.css";

export default function PatientDetails() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem("role");

    useEffect(() => {
        fetchPatient();
    }, [patientId]);

    const fetchPatient = async () => {
        try {
            const token = localStorage.getItem("token");
            const endpoint = role === "admin"
                ? `https://medicore-connect.onrender.com/api/admin/patient/${patientId}`
                : `https://medicore-connect.onrender.com/api/doctor/patient/${patientId}`;

            const res = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatient(role === "admin" ? res.data : res.data); // Backend response structures are slightly different
            // In adminController it returns success: true and spreads, so we need to handle that mapping if different.
            // Actually I'll check the spreading.
            setPatient(role === "admin" ? res.data : res.data);
        } catch (err) {
            console.error("Failed to fetch patient");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state">Loading patient profile...</div>;
    if (!patient) return <div className="error-state">Patient not found</div>;

    return (
        <>
            {role === "admin" && <AdminNavbar />}
            <div className="patient-details-wrapper">
                <div className="patient-details-container">
                    {/* HEADER */}
                    <header className="details-header">
                        <div className="patient-summary">
                            <div className="patient-avatar">{(patient.name || "?").charAt(0)}</div>
                            <div className="header-text">
                                <h2>{patient.name}</h2>
                                <p className="sub-detail">
                                    <span className="tag">{patient.gender}</span>
                                    <span className="tag">{patient.age} Years</span>
                                    <span className="tag blood">{patient.bloodGroup || "O+"}</span>
                                </p>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
                        </div>
                    </header>

                    <div className="details-body">

                        {/* ACTION BAR */}
                        {role === "doctor" && (
                            <div className="quick-actions-bar" style={{ marginBottom: '2rem' }}>
                                <button className="action-btn report" onClick={() => navigate(`/doctor/report/create/${patientId}`)}>
                                    📝 Create Clinical Report
                                </button>
                                <button className="action-btn prescription" onClick={() => navigate(`/doctor/prescription/create/${patientId}`)}>
                                    💊 Issue Prescription
                                </button>
                            </div>
                        )}

                        {/* PERSONAL INFO GRID */}
                        <div className="info-grid" style={{ marginBottom: '2rem' }}>
                            <div className="info-card">
                                <h3>Contact Information</h3>
                                <p><strong>Phone:</strong> {patient.phone}</p>
                                <p><strong>Email:</strong> {patient.email || "N/A"}</p>
                                <p><strong>Address:</strong> {patient.address?.line1}, {patient.address?.city}, {patient.address?.state} - {patient.address?.pincode}</p>
                                <p><strong>Assigned Physician:</strong> {patient.assignedDoctor?.name} ({patient.assignedDoctor?.specialization})</p>
                            </div>
                            <div className="info-card">
                                <h3>Emergency Contact</h3>
                                <p><strong>Name:</strong> {patient.emergencyContact?.name || "N/A"}</p>
                                <p><strong>Relation:</strong> {patient.emergencyContact?.relation || "N/A"}</p>
                                <p><strong>Phone:</strong> {patient.emergencyContact?.phone || "N/A"}</p>
                            </div>
                        </div>

                        {/* MEDICAL OVERVIEW */}
                        <div className="medical-sections" style={{ marginBottom: '2rem' }}>
                            <div className="med-box">
                                <h4>Existing Conditions</h4>
                                <ul>
                                    {patient.existingConditions?.length > 0 ? (
                                        patient.existingConditions.map((c, i) => <li key={i}>{c}</li>)
                                    ) : <li>No conditions recorded</li>}
                                </ul>
                            </div>
                            <div className="med-box">
                                <h4>Allergies</h4>
                                <ul>
                                    {patient.allergies?.length > 0 ? (
                                        patient.allergies.map((a, i) => <li key={i}>{a}</li>)
                                    ) : <li>No allergies recorded</li>}
                                </ul>
                            </div>
                        </div>

                        {/* HISTORY SECTIONS */}
                        <div className="history-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                            {/* REPORTS */}
                            <div className="history-section">
                                <h3 style={{ color: 'var(--primary-800)', borderBottom: '2px solid var(--primary-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Medical Reports History</h3>
                                {patient.reports?.length > 0 ? (
                                    <div className="history-list">
                                        {patient.reports.map(report => (
                                            <div key={report._id} className="history-card-item" onClick={() => navigate(role === "admin" ? `/admin/report/view/${report._id}` : `/doctor/report/view/${report._id}`)}>
                                                <div className="item-left">
                                                    <span className="date-badge">{new Date(report.date).toLocaleDateString()}</span>
                                                    <div className="item-info">
                                                        <strong>{report.reportTitle}</strong>
                                                        <span className="doc-name">Dr. {report.doctor?.name}</span>
                                                    </div>
                                                </div>
                                                <span className="arrow-btn">View →</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="empty-text" style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>No medical reports found.</p>}
                            </div>

                            {/* PRESCRIPTIONS */}
                            <div className="history-section">
                                <h3 style={{ color: 'var(--accent-800)', borderBottom: '2px solid var(--accent-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Prescription History</h3>
                                {patient.prescriptions?.length > 0 ? (
                                    <div className="history-list">
                                        {patient.prescriptions.map(pres => (
                                            <div key={pres._id} className="history-card-item" onClick={() => navigate(role === "admin" ? `/admin/prescription/view/${pres._id}` : `/doctor/prescription/view/${pres._id}`)}>
                                                <div className="item-left">
                                                    <span className="date-badge" style={{ background: 'var(--accent-50)', color: 'var(--accent-700)' }}>{new Date(pres.createdAt).toLocaleDateString()}</span>
                                                    <div className="item-info">
                                                        <strong>{pres.diagnosis || "General Consultation"}</strong>
                                                        <span className="doc-name">Dr. {pres.doctor?.name}</span>
                                                    </div>
                                                </div>
                                                <span className="arrow-btn" style={{ color: 'var(--accent-600)' }}>View →</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="empty-text" style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>No prescriptions found.</p>}
                            </div>

                            {/* LABS */}
                            <div className="history-section" style={{ marginTop: '1rem' }}>
                                <h3 style={{ color: 'var(--blue-800)', borderBottom: '2px solid var(--blue-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Lab History</h3>
                                {patient.labReports?.length > 0 ? (
                                    <div className="history-list">
                                        {patient.labReports.map(item => (
                                            <div
                                                key={item._id}
                                                className="history-card-item scan-item"
                                                onClick={() => navigate(role === "admin" ? `/admin/lab-report/view/${item._id}` : `/doctor/lab-report/view/${item._id}`)}
                                            >
                                                <div className="item-left">
                                                    <span className="date-badge" style={{ background: 'var(--blue-50)', color: 'var(--blue-700)' }}>
                                                        {new Date(item.testDate).toLocaleDateString()}
                                                    </span>
                                                    <div className="item-info">
                                                        <strong>{item.testName} ({item.testType})</strong>
                                                        <span className="doc-name">
                                                            Req by: Dr. {item.doctor?.name || "N/A"} |
                                                            Status: <span style={{ fontWeight: 'bold', color: item.isVerified ? 'green' : 'orange' }}>{item.isVerified ? 'Verified' : 'Pending'}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="arrow-btn" style={{ color: 'var(--blue-600)' }}>View →</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="empty-text" style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>No lab history found.</p>}
                            </div>

                            {/* SCANS */}
                            <div className="history-section" style={{ marginTop: '1rem' }}>
                                <h3 style={{ color: 'var(--teal-800)', borderBottom: '2px solid var(--teal-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Scan History</h3>
                                {patient.scanReports?.length > 0 ? (
                                    <div className="history-list">
                                        {patient.scanReports.map(item => (
                                            <div
                                                key={item._id}
                                                className="history-card-item scan-item"
                                                onClick={() => navigate(role === "admin" ? `/admin/scan-report/view/${item._id}` : `/doctor/scan-report/view/${item._id}`)}
                                            >
                                                <div className="item-left">
                                                    <span className="date-badge" style={{ background: 'var(--teal-50)', color: 'var(--teal-700)' }}>
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <div className="item-info">
                                                        <strong>{item.scanName} ({item.type})</strong>
                                                        <span className="doc-name">
                                                            Req by: Dr. {item.doctor?.name || "N/A"} |
                                                            Status: <span style={{ fontWeight: 'bold', color: item.isVerified ? 'green' : 'orange' }}>{item.isVerified ? 'Verified' : 'Pending'}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="arrow-btn" style={{ color: 'var(--teal-600)' }}>View →</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="empty-text" style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>No scan history found.</p>}
                            </div>

                        </div>

                        <style>{`
                        .history-card-item {
                            background: white;
                            border: 1px solid var(--slate-200);
                            padding: 1rem;
                            border-radius: 12px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 0.75rem;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        }
                        .history-card-item:hover {
                            border-color: var(--primary-300);
                            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                            transform: translateX(4px);
                        }
                        .item-left {
                            display: flex;
                            gap: 1rem;
                            align-items: center;
                        }
                        .date-badge {
                            background: var(--primary-50);
                            color: var(--primary-700);
                            padding: 0.35rem 0.75rem;
                            border-radius: 8px;
                            font-weight: 600;
                            font-size: 0.85rem;
                            min-width: 100px;
                            text-align: center;
                        }
                        .item-info {
                            display: flex;
                            flex-direction: column;
                        }
                        .doc-name {
                            font-size: 0.8rem;
                            color: var(--slate-500);
                        }
                        .arrow-btn {
                            font-weight: 600;
                            color: var(--primary-600);
                        }
                    `}</style>
                    </div>
                </div>
            </div>
        </>
    );
}
