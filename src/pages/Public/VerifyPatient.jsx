import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function VerifyPatient() {
    const [searchParams] = useSearchParams();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState('past');

    useEffect(() => {
        try {
            const encodedData = searchParams.get("data");

            if (encodedData) {
                const decodedData = JSON.parse(atob(encodedData));
                console.log("Decoded Patient Data:", decodedData);

                // Enhance data with mock visits/docs if not present, to simulate "live" feel for demo
                const enhancedData = {
                    ...decodedData,
                    visits: decodedData.visits || [
                        { date: decodedData.registrationDate, type: "Patient Registration", doctor: "Administration", status: "Completed" },
                        { date: new Date(Date.now() - 86400000 * 10).toISOString(), type: "General Checkup", doctor: "Dr. Sarah Smith", status: "Completed" },
                        { date: new Date(Date.now() - 86400000 * 60).toISOString(), type: "Blood Test", doctor: "Lab Technician", status: "Reviewed" }
                    ],
                    futureVisits: decodedData.futureVisits || [
                        { date: new Date(Date.now() + 86400000 * 5).toISOString(), type: "Follow-up", doctor: "Dr. Sarah Smith", status: "Scheduled" }
                    ],
                    documents: decodedData.documents || [
                        { name: "Hospital_Bill.pdf", size: "150kb", type: "pdf" }
                    ]
                };

                setPatient(enhancedData);
            } else {
                setError("No patient data found.");
            }
        } catch (err) {
            console.error("Error decoding data:", err);
            setError("Invalid patient data.");
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    const formatAddress = (addr) => {
        if (!addr) return "N/A";
        // Handle if address is just a string or object
        if (typeof addr === 'string') return addr;
        const parts = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode];
        return parts.filter(p => p).join(", ");
    };

    const formatDate = (dateString, includeTime = false) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...(includeTime && { hour: '2-digit', minute: '2-digit' })
        });
    };

    const handleDownload = (doc) => {
        if (doc.url) {
            // Real download link
            window.open(doc.url, '_blank');
        } else {
            // Simulated download
            const link = document.createElement('a');
            link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent("Sample Data for " + doc.name);
            link.download = doc.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (loading) return <div className="verify-container">Verifying...</div>;
    if (error) return <div className="verify-container error">{error}</div>;

    const currentVisits = activeTab === 'past' ? patient.visits : patient.futureVisits;

    return (
        <div className="verify-dashboard">
            {/* Full Width Top Header */}
            <header className="main-header">
                <div className="header-content">
                    <div className="logo-section">
                        <h1>SAKRA WORLD HOSPITAL</h1>
                        <span className="subtitle">Patient Verification Portal</span>
                    </div>
                    <div className="header-badge">
                        <span className="badge-icon">✔</span> Verified Patient
                    </div>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="dashboard-grid">
                    {/* 1. Profile Card (Left) */}
                    <div className="dash-card profile-card">
                        <div className="profile-header">
                            <div className="avatar-large">
                                {patient.name.charAt(0)}
                            </div>
                            <h2 className="profile-name">{patient.name}</h2>
                            <p className="profile-id">ID: {patient.id.substring(patient.id.length - 6).toUpperCase()}</p>
                        </div>
                        <div className="profile-contact">
                            <div className="contact-row">
                                <span className="icon">📞</span>
                                <span>{patient.phone}</span>
                            </div>
                            <div className="contact-row">
                                <span className="icon">✉️</span>
                                <span>{patient.email || "No Email"}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. General Information (Middle) */}
                    <div className="dash-card general-info">
                        <div className="card-header">
                            <h3>General Information</h3>
                        </div>
                        <div className="info-list">
                            <div className="info-row">
                                <label>Date of Birth / Age</label>
                                <p>{patient.age} Years (Approx)</p>
                            </div>
                            <div className="info-row">
                                <label>Gender</label>
                                <p>{patient.gender}</p>
                            </div>
                            <div className="info-row">
                                <label>Address</label>
                                <p className="address-text">{formatAddress(patient.address)}</p>
                            </div>
                            <div className="info-row">
                                <label>Registration Date</label>
                                <p>{formatDate(patient.registrationDate)}</p>
                            </div>
                            <div className="info-row">
                                <label>Emergency Contact</label>
                                <p>{patient.emergencyContact || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    {/* 3. Medical Profile (Right) */}
                    <div className="dash-card medical-info">
                        <div className="card-header">
                            <h3>Anamnesis / Medical</h3>
                        </div>
                        <div className="info-list">
                            <div className="info-row">
                                <label>Blood Type</label>
                                <p className="highlight">{patient.bloodGroup || "Unknown"}</p>
                            </div>
                            <div className="info-row">
                                <label>Chronic Diseases</label>
                                <div className="tags">
                                    {patient.history && patient.history.length > 0 && patient.history[0] !== "NO"
                                        ? patient.history.map((h, i) => <span key={i} className="tag warning">{h}</span>)
                                        : <span className="tag neutral">None Reported</span>
                                    }
                                </div>
                            </div>
                            <div className="info-row">
                                <label>Allergies</label>
                                <p>N/A</p>
                            </div>
                        </div>
                    </div>

                    {/* 4. Visits & History (Bottom Left - Wide) */}
                    <div className="dash-card visits-section">
                        <div className="tabs-header">
                            <button
                                className={`tab ${activeTab === 'past' ? 'active' : ''}`}
                                onClick={() => setActiveTab('past')}
                            >
                                Past Visits
                            </button>
                            <button
                                className={`tab ${activeTab === 'future' ? 'active' : ''}`}
                                onClick={() => setActiveTab('future')}
                            >
                                Future Visits
                            </button>
                        </div>
                        <div className="visits-table-wrapper">
                            <table className="visits-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Service / Type</th>
                                        <th>Doctor / Dept</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentVisits && currentVisits.length > 0 ? (
                                        currentVisits.map((visit, index) => (
                                            <tr key={index}>
                                                <td>{formatDate(visit.date)}</td>
                                                <td>{visit.type}</td>
                                                <td>{visit.doctor}</td>
                                                <td>
                                                    <span className={`status-badge ${visit.status === 'Completed' ? 'success' : 'pending'}`}>
                                                        {visit.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No visits found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 5. Files/Notes (Bottom Right) */}
                    <div className="dash-card files-section">
                        <div className="card-header">
                            <h3>Documents</h3>
                        </div>
                        <div className="files-list">
                            {patient.documents && patient.documents.map((doc, index) => (
                                <div className="file-item" key={index} onClick={() => handleDownload(doc)}>
                                    <span className="file-icon">📄</span>
                                    <div className="file-details">
                                        <span className="file-name">{doc.name}</span>
                                        <span className="file-size">{doc.size}</span>
                                    </div>
                                    <span className="file-action">⬇️</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                :root {
                    --bg-page: #f0f4f8;
                    --card-bg: #ffffff;
                    --primary: #0f766e;
                    --primary-dark: #115e59;
                    --text-main: #1e293b;
                    --text-light: #64748b;
                    --border-color: #e2e8f0;
                    
                    /* Accent Colors */
                    --accent-teal: #14b8a6;
                    --accent-blue: #3b82f6;
                    --accent-indigo: #6366f1;
                    --accent-rose: #f43f5e;
                    --accent-amber: #f59e0b;
                }

                .verify-dashboard {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
                    color: var(--text-main);
                    display: flex;
                    flex-direction: column;
                    width: 100vw; /* Force full viewport width */
                    overflow-x: hidden; /* Prevent scrollbar if 100vw causes issues with scrollbar width */
                    margin: 0;
                    padding: 0;
                    position: absolute;
                    top: 0;
                    left: 0;
                }

                /* Header Styles */
                .main-header {
                    background: linear-gradient(135deg, #0f766e, #083344);
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    padding: 1rem 0; /* Vertical padding only, horizontal handled by container */
                    box-shadow: 0 4px 20px rgba(15, 118, 110, 0.25);
                    color: white;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                }
                .header-content {
                    width: 100%;
                    max-width: 1280px; /* Centered container width */
                    padding: 0 2rem; /* Inner padding */
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .logo-section h1 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: white;
                    letter-spacing: -0.02em;
                    margin: 0;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .subtitle {
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.8);
                    font-weight: 500;
                }
                .header-badge {
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 99px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 700;
                    font-size: 0.85rem;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                .badge-icon {
                    background: white;
                    color: #0f766e;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.6rem;
                    font-weight: 900;
                }

                /* Main Content */
                .dashboard-content {
                    padding: 2rem 0; /* Vertical padding */
                    width: 100%; 
                    flex: 1;
                    display: flex;
                    justify-content: center;
                }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                    width: 100%;
                    max-width: 1280px; /* Same max-width as header */
                    padding: 0 2rem; /* Match header padding */
                    height: fit-content;
                }

                .dash-card {
                    background: var(--card-bg);
                    border-radius: 20px;
                    padding: 1.5rem;
                    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05);
                    border: 1px solid white;
                    height: 100%;
                    position: relative;
                    overflow: hidden;
                }

                /* Decoration for Cards */
                .dash-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 6px;
                    background: var(--primary);
                }

                /* Specific Card Accents */
                .profile-card::before { background: var(--accent-blue); }
                .general-info::before { background: var(--accent-indigo); }
                .medical-info::before { background: var(--accent-rose); }
                .visits-section::before { background: var(--accent-teal); }
                .files-section::before { background: var(--accent-amber); }

                .card-header h3 {
                    font-size: 1.1rem;
                    font-weight: 800;
                    margin-bottom: 1.5rem;
                    color: var(--text-main);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                /* Profile Card */
                .profile-card {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: linear-gradient(to bottom, #ffffff, #f8fafc);
                }
                .profile-header {
                    margin-bottom: 2rem;
                    width: 100%;
                }
                .avatar-large {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #e0f2fe, #bae6fd);
                    margin: 0 auto 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    font-weight: 700;
                    color: #0284c7;
                    border: 4px solid white;
                    box-shadow: 0 8px 16px -4px rgba(59, 130, 246, 0.2);
                }
                .profile-name {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-bottom: 0.25rem;
                    background: linear-gradient(90deg, #0f172a, #334155);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .profile-id {
                    color: var(--accent-blue);
                    font-weight: 700;
                    font-size: 0.95rem;
                    background: #eff6ff;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    display: inline-block;
                }
                .profile-contact {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .contact-row {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--text-light);
                    font-size: 0.95rem;
                    background: white;
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    border: 1px solid #f1f5f9;
                    transition: transform 0.2s;
                }
                .contact-row:hover {
                    transform: translateY(-2px);
                    border-color: var(--accent-blue);
                }
                .contact-row .icon {
                    font-size: 1rem;
                    background: #eff6ff;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                }

                /* Info Lists */
                .info-row {
                    margin-bottom: 1.25rem;
                }
                .info-row label {
                    display: block;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: #94a3b8;
                    font-weight: 800;
                    margin-bottom: 0.35rem;
                    letter-spacing: 0.05em;
                }
                .info-row p, .address-text {
                    font-weight: 600;
                    color: var(--text-main);
                    font-size: 1rem;
                    line-height: 1.4;
                }
                .highlight {
                    font-size: 1.5rem !important;
                    font-weight: 800 !important;
                    color: var(--accent-rose) !important;
                }

                /* Tags */
                .tags {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .tag {
                    padding: 0.35rem 0.85rem;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 700;
                }
                .tag.neutral { background: #f1f5f9; color: #64748b; }
                .tag.warning { 
                    background: #fff1f2; 
                    color: #be123c; 
                    border: 1px solid #ffe4e6;
                }

                /* Visits Section */
                .visits-section {
                    grid-column: span 2;
                }
                .visits-table-wrapper {
                    overflow-x: auto;
                    border-radius: 12px;
                    border: 1px solid #f1f5f9;
                }
                .tabs-header {
                    display: flex;
                    gap: 2rem;
                    margin-bottom: 1.5rem;
                    border-bottom: 2px solid #f1f5f9;
                }
                .tab {
                    background: none;
                    border: none;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-light);
                    padding-bottom: 0.75rem;
                    cursor: pointer;
                    position: relative;
                    transition: color 0.2s;
                }
                .tab:hover { color: var(--accent-teal); }
                .tab.active {
                    color: var(--accent-teal);
                }
                .tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: var(--accent-teal);
                }

                .visits-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .visits-table th {
                    text-align: left;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: #64748b;
                    font-weight: 800;
                    padding: 1rem;
                    background: #f8fafc;
                    letter-spacing: 0.05em;
                }
                .visits-table td {
                    padding: 1rem;
                    border-top: 1px solid #f1f5f9;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #334155;
                }
                .status-badge {
                    padding: 0.35rem 0.75rem;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 800;
                }
                .status-badge.success {
                    background: #ecfdf5;
                    color: #047857;
                    border: 1px solid #d1fae5;
                }

                /* Files Section */
                .files-section {
                    grid-column: span 1;
                }
                .files-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .file-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: linear-gradient(to right, #fffbeb, #ffffff);
                    border-radius: 16px;
                    transition: all 0.2s;
                    cursor: pointer;
                    border: 1px solid #fef3c7;
                    box-shadow: 0 2px 5px rgba(245, 158, 11, 0.05);
                }
                .file-item:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 15px rgba(245, 158, 11, 0.1);
                    border-color: #fcd34d;
                }
                .file-icon { 
                    font-size: 1.2rem; 
                    background: #fff7ed;
                    color: #f59e0b;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                }
                .file-details { flex: 1; overflow: hidden; }
                .file-name { display: block; font-weight: 700; font-size: 0.9rem; color: #451a03; }
                .file-size { font-size: 0.75rem; color: #92400e; font-weight: 500; }
                .file-action { 
                    color: #f59e0b; 
                    background: white;
                    width: 30px; height: 30px;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 50%;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }

                /* Error/Loading */
                .verify-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    background: #0f172a;
                    font-family: sans-serif;
                }
                .error { background: #7f1d1d; }

                /* Responsive */
                @media (max-width: 1024px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                    .visits-section, .files-section {
                        grid-column: auto;
                    }
                }
            `}</style>
        </div>
    );
}
