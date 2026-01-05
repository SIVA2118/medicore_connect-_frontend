import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/Doctor/Report.css"; // Reuse existing report styles or create new

export default function ViewScanReport() {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem("role");

    useEffect(() => {
        fetchReport();
    }, [reportId]);

    const fetchReport = async () => {
        try {
            const token = localStorage.getItem("token");
            const role = localStorage.getItem("role"); // Assuming role is stored

            let url = `https://medicore-connect.onrender.com/api/doctor/scan-report/${reportId}`;
            if (role === "scanner") {
                url = `https://medicore-connect.onrender.com/api/scanner/scan-report/${reportId}`;
            }

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setReport(res.data.report);
            }
        } catch (err) {
            console.error("Failed to fetch scan report");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(`https://medicore-connect.onrender.com/api/scanner/scan-report/verify/${reportId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                alert("Report verified successfully!");
                fetchReport(); // Refresh report data
            }
        } catch (err) {
            console.error("Failed to verify report", err);
            alert("Failed to verify report: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`https://medicore-connect.onrender.com/api/scanner/scan-report/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Report deleted successfully");
            navigate("/scanner/reports");
        } catch (err) {
            console.error("Failed to delete report", err);
            alert("Failed to delete report");
        }
    };

    if (loading) return <div className="loading-state">Loading scan report...</div>;
    if (!report) return <div className="error-state">Report not found</div>;

    return (
        <>
            {role === "admin" && <AdminNavbar />}
            <div className="view-report-container">
                <header className="report-header">
                    <div>
                        <h1>{report.scanName}</h1>
                        <span className={`status-badge ${report.isVerified ? 'verified' : 'pending'}`}>
                            {report.isVerified ? "VERIFIED" : "PENDING VERIFICATION"}
                        </span>
                    </div>
                    <div className="header-actions">
                        {/* Doctor Verify Action */}
                        {role === "doctor" && !report.isVerified && (
                            <button className="btn-primary" onClick={handleVerify} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                                Verify Report
                            </button>
                        )}

                        {/* Scanner Actions */}
                        {role === "scanner" && !report.isVerified && (
                            <>
                                <button className="btn-secondary" onClick={() => navigate("/scanner/create-report", { state: { report } })}>Edit</button>
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
                            {report.patient?.profileImage ? <img src={report.patient.profileImage} alt="Patient" className="profile-img-lg" /> : <div className="profile-placeholder">👤</div>}
                            <div>
                                <p><strong>Name:</strong> {report.patient?.name}</p>
                                <p><strong>Age/Gender:</strong> {report.patient?.age} / {report.patient?.gender}</p>
                                <p><strong>MRN:</strong> {report.patient?.mrn || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="report-section">
                        <h3>Scan Details</h3>
                        <div className="detail-grid">
                            <p><strong>Type:</strong> {report.type}</p>
                            <p><strong>Date:</strong> {new Date(report.scanDate).toLocaleDateString()}</p>
                            <div className="doc-info-sm">
                                <strong>Requested By:</strong>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                                    {report.doctor?.profileImage && <img src={report.doctor.profileImage} className="avatar-small" alt="" />}
                                    <span>Dr. {report.doctor?.name || 'N/A'}</span>
                                </div>
                            </div>
                            <p><strong>Assigned Scanner:</strong> {report.assignedTo?.name || 'Pool/Unassigned'}</p>
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
                            <p><strong>Result Status:</strong> <span className={`status-text ${report.resultStatus?.toLowerCase()}`}>{report.resultStatus}</span></p>
                            <p><strong>Report Date:</strong> {report.reportGeneratedDate ? new Date(report.reportGeneratedDate).toLocaleDateString() : 'Pending'}</p>
                            <p><strong>Lab Name:</strong> {report.labName || 'Hospital Lab'}</p>
                            <p><strong>Technician:</strong> {report.technicianName || 'N/A'}</p>
                        </div>

                        <div className="findings-box">
                            <h4>Clinical Indication</h4>
                            <p>{report.indication || "None"}</p>
                        </div>

                        <div className="findings-box">
                            <h4>Findings</h4>
                            <p style={{ whiteSpace: 'pre-line' }}>{report.findings || "No detailed findings recorded."}</p>
                        </div>

                        <div className="impression-box">
                            <h4>Impression</h4>
                            <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{report.impression || "No impression recorded."}</p>
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
                                    <a href={report.pdfFile} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                        📄 View Full PDF
                                    </a>
                                )}
                            </div>
                        )}

                        <div className="meta-footer">
                            <p><strong>Created By:</strong> Dr. {report.doctor?.name || "Scanner"}</p>
                            {report.isVerified && <p><strong>Verified By:</strong> Dr. {report.verifiedBy?.name || "N/A"}</p>}
                        </div>
                    </div>

                    {!report.isVerified && (
                        <div className="verification-pending-msg" style={{ marginBottom: '2rem' }}>
                            <p>This report is currently <strong>PENDING VERIFICATION</strong> by a radiologist.</p>
                        </div>
                    )}

                    <div className="report-section billing-section">
                        <h3>Billing Info</h3>
                        <div className="detail-grid">
                            <p><strong>Cost:</strong> ₹{report.cost}</p>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .view-report-container {
                    max-width: 900px;
                    margin: 2rem auto;
                    padding: 3rem;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.08); // Premium shadow
                    font-family: 'Inter', sans-serif;
                }
                .report-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid #f1f5f9;
                    padding-bottom: 1.5rem;
                    margin-bottom: 2rem;
                }
                .report-header h1 {
                    margin: 0 0 0.5rem 0;
                    color: #0f172a;
                    font-size: 2rem;
                    font-weight: 700;
                }
                .report-header p {
                    color: #64748b;
                    margin: 0;
                }
                .status-badge {
                    display: inline-block;
                    margin-top: 0.8rem;
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }
                .status-badge.verified { background: #dcfce7; color: #166534; }
                .status-badge.pending { background: #ffedd5; color: #9a3412; }

                .report-section {
                    margin-bottom: 2.5rem;
                }
                .report-section h3 {
                    color: #334155;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 0.8rem;
                    margin-bottom: 1.2rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                }
                .detail-grid p {
                    margin: 0;
                    color: #475569;
                    font-size: 0.95rem;
                }
                .detail-grid strong {
                    color: #1e293b;
                    display: block;
                    margin-bottom: 0.2rem;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    opacity: 0.8;
                }

                /* IMAGES */
                .images-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 1rem;
                }
                .scan-image-card {
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .scan-image-card:hover {
                    transform: scale(1.02);
                }
                .scan-image-card img {
                    width: 100%;
                    height: 150px;
                    object-fit: cover;
                    display: block;
                }

                .results-section {
                    background: #f8fafc;
                    padding: 2rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }
                .findings-box, .impression-box {
                    margin-bottom: 2rem;
                }
                .findings-box h4, .impression-box h4 {
                    margin: 0 0 0.8rem 0;
                    color: #334155;
                    font-size: 1rem;
                    font-weight: 600;
                }
                .findings-box p, .impression-box p {
                    color: #1e293b;
                    line-height: 1.6;
                }
                .meta-footer {
                    margin-top: 2rem;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 1rem;
                    display: flex;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                    font-size: 0.9rem;
                    color: #64748b;
                }
                .status-text.normal { color: green; font-weight: bold; }
                .status-text.abnormal { color: orange; font-weight: bold; }
                .status-text.critical { color: red; font-weight: bold; }
                
                .verification-pending-msg {
                    background: #fff7ed;
                    border: 1px solid #fed7aa;
                    padding: 1.5rem;
                    border-radius: 8px;
                    color: #c2410c;
                    font-weight: 500;
                    text-align: center;
                }

                .pay-status.paid { color: green; font-weight: bold; }
                .pay-status.unpaid { color: red; font-weight: bold; }

                .profile-header-sm {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }
                .profile-img-lg {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #f1f5f9;
                }
                .profile-placeholder {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: #f1f5f9;
                    display: grid;
                    place-items: center;
                    font-size: 2rem;
                }
                .avatar-small {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    object-fit: cover;
                }
                .header-actions {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }
                .btn-primary {
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 0.6rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
                }
                .btn-primary:hover {
                    background: #059669;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3);
                }
                .btn-secondary {
                    background: #f1f5f9;
                    color: #475569;
                    border: 1px solid #e2e8f0;
                    padding: 0.6rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .btn-secondary:hover {
                    background: #e2e8f0;
                    color: #1e293b;
                }
                .btn-danger {
                    background: #fee2e2;
                    color: #dc2626;
                    border: 1px solid #fecaca;
                    padding: 0.6rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .btn-danger:hover {
                    background: #dc2626;
                    color: white;
                    border-color: #dc2626;
                }
            `}</style>
        </>
    );
}
