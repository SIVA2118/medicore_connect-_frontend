import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import LabNavbar from "../../components/LabNavbar";
import "../../styles/lab/ViewLabReport.css";

export default function ViewLabReport() {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`https://medicore-connect.onrender.com/api/lab/report/${reportId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setReport(res.data.report);
                }
            } catch (err) {
                console.error("Failed to fetch report", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [reportId]);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`https://medicore-connect.onrender.com/api/lab/report/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Report deleted successfully");
            navigate("/lab/reports");
        } catch (err) {
            console.error("Failed to delete report", err);
            alert("Failed to delete report");
        }
    };

    if (loading) return <div className="loading-state">Loading lab report...</div>;
    if (!report) return <div className="error-state">Report not found</div>;

    const resultStatus = report.resultStatus?.toLowerCase() || 'pending';

    return (
        <>
            <LabNavbar />
            <div className="view-report-container">
                <header className="report-header">
                    <div>
                        <h1>{report.testName}</h1>
                        <span className={`status-badge ${report.resultStatus === 'Critical' ? 'critical' : report.isVerified ? 'verified' : 'pending'}`}>
                            {report.isVerified ? "VERIFIED" : "PENDING VERIFICATION"}
                        </span>
                    </div>
                    <div className="header-actions">
                        {!report.isVerified && (
                            <>
                                <button className="btn-secondary" onClick={() => navigate("/lab/create-report", { state: { report } })}>Edit</button>
                                <button className="btn-danger" onClick={handleDelete}>Delete</button>
                            </>
                        )}
                        <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
                    </div>
                </header>

                <div className="report-content">
                    <div className="report-section">
                        <h3>Patient Details</h3>
                        <div className="profile-header-sm">
                            {report.patient?.profileImage ? (
                                <img src={report.patient.profileImage} alt="Patient" className="profile-img-lg" />
                            ) : (
                                <div className="profile-placeholder">👤</div>
                            )}
                            <div>
                                <p><strong>Name:</strong> {report.patient?.name}</p>
                                <p><strong>Age/Gender:</strong> {report.patient?.age} / {report.patient?.gender}</p>
                                <p><strong>MRN:</strong> {report.patient?.mrn || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="report-section">
                        <h3>Test Details</h3>
                        <div className="detail-grid">
                            <p><strong>Type:</strong> {report.testType}</p>
                            <p><strong>Date:</strong> {new Date(report.testDate).toLocaleDateString()}</p>
                            <div className="doc-info-sm">
                                <strong>Requested By:</strong>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                                    {report.doctor?.profileImage && <img src={report.doctor.profileImage} className="avatar-small" alt="" />}
                                    <span>Dr. {report.doctor?.name || 'Unassigned'}</span>
                                </div>
                            </div>
                            <p><strong>Assigned To:</strong> {report.assignedTo?.name || 'Pool/Unassigned'}</p>
                        </div>
                    </div>

                    <div className="report-section">
                        <h3>Clinical Info</h3>
                        <div className="detail-grid">
                            <p><strong>Description:</strong> {report.description || "None"}</p>
                        </div>
                    </div>

                    <div className="report-section results-section">
                        <h3>Detailed Report</h3>
                        <div className="detail-grid" style={{ marginBottom: '2rem' }}>
                            <p><strong>Result Status:</strong> <span className={`status-text ${resultStatus}`}>{report.resultStatus}</span></p>
                            <p><strong>Report Date:</strong> {report.reportGeneratedDate ? new Date(report.reportGeneratedDate).toLocaleDateString() : 'Pending'}</p>
                            <p><strong>Lab Name:</strong> {report.labName || 'Hospital Lab'}</p>
                            <p><strong>Technician:</strong> {report.technicianName || 'N/A'}</p>
                        </div>

                        <div className="findings-box">
                            <h4>Observations / Results</h4>
                            <p style={{ whiteSpace: 'pre-line' }}>{report.resultDetails || "No detailed results recorded."}</p>
                        </div>

                        {report.pdfFile && (
                            <div className="pdf-section" style={{ marginTop: '2rem' }}>
                                <h4>PDF Report</h4>
                                {report.pdfFile.startsWith('data:') ? (
                                    <button
                                        className="btn-secondary"
                                        onClick={() => {
                                            const win = window.open();
                                            if (win) {
                                                win.document.write('<iframe src="' + report.pdfFile + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
                                            }
                                        }}
                                    >
                                        📄 View Uploaded PDF
                                    </button>
                                ) : (
                                    <a href={report.pdfFile} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                                        📄 View Full PDF
                                    </a>
                                )}
                            </div>
                        )}

                        <div className="meta-footer">
                            <p><strong>Created By:</strong> {report.technicianName || "Lab Technician"}</p>
                            {report.isVerified && <p><strong>Verified By:</strong> Dr. {report.verifiedBy?.name || "N/A"}</p>}
                        </div>
                    </div>

                    <div className="report-section billing-section">
                        <h3>Billing Info</h3>
                        <div className="detail-grid">
                            <p><strong>Cost:</strong> ₹{report.cost}</p>
                            <p><strong>Status:</strong> {report.isBilled ? <span style={{ color: 'green', fontWeight: 'bold' }}>Billed</span> : <span style={{ color: 'orange', fontWeight: 'bold' }}>Pending</span>}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
