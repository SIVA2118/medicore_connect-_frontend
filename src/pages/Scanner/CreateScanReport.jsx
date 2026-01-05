import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate, useLocation
import ScannerNavbar from "../../components/ScannerNavbar";
import "../../styles/Scanner/CreateScanReport.css"; // Reuse form styles

export default function CreateScanReport() {
    const navigate = useNavigate(); // Initialize hook
    const location = useLocation();
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        id: "", // For edit mode
        patient: "",
        doctor: "", // New field
        patientName: "",
        type: "X-Ray",
        scanName: "",
        description: "",
        indication: "",
        findings: "",
        impression: "",
        labName: "",
        technicianName: "",
        resultStatus: "Normal",
        pdfFile: "",
        reportGeneratedDate: new Date().toISOString().split("T")[0],
        scanDate: new Date().toISOString().split("T")[0],
        cost: 0,
        isVerified: false,
        verifiedBy: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("httpss:/medicmre-eonnect-8rir.vercel.appect-8ris.vercel.app/api/scanner/all-doctors", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setDoctors(res.data.doctors);
                }
            } catch (err) {
                console.error("Failed to fetch doctors");
            }
        };
        fetchData();
    }, []);

    // NOTE: For this step I will assume the user enters the Patient ID manually or we implement a search later.
    // To make it user friendly, I will fetch patients.
    // I will add `getAllPatients` permission for scanner in next step.

    useEffect(() => {
        if (location.state?.report) {
            const r = location.state.report;
            setFormData(prev => ({
                ...prev,
                id: r._id,
                patient: r.patient?._id || r.patient || "",
                patientName: r.patient?.name || "",
                doctor: r.doctor?._id || r.doctor || "",
                type: r.type || "X-Ray",
                scanName: r.scanName || "",
                description: r.description || "",
                indication: r.indication || "",
                findings: r.findings || "",
                impression: r.impression || "",
                labName: r.labName || "",
                technicianName: r.technicianName || "",
                resultStatus: r.resultStatus || "Normal",
                pdfFile: r.pdfFile || "",
                reportGeneratedDate: r.reportGeneratedDate ? r.reportGeneratedDate.split("T")[0] : new Date().toISOString().split("T")[0],
                cost: r.cost || 0,
                scanDate: r.scanDate ? r.scanDate.split("T")[0] : new Date().toISOString().split("T")[0],
                isVerified: r.isVerified || !!(r.doctor?._id || r.doctor),
                verifiedBy: r.verifiedBy?._id || r.verifiedBy || (r.isVerified ? (r.doctor?._id || r.doctor) : "")
            }));
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const userRole = localStorage.getItem("role")?.toLowerCase();

        if (name === "doctor") {
            if (value) {
                // Automate verification ONLY if the user is a doctor
                setFormData({
                    ...formData,
                    doctor: value,
                    isVerified: true,
                    verifiedBy: value
                });
            } else {
                setFormData({
                    ...formData,
                    doctor: "",
                    isVerified: false,
                    verifiedBy: ""
                });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");

            // Format payload
            const payload = { ...formData };

            // Critical: Mongoose fails if you send an empty string for an ObjectId field
            if (!payload.doctor) payload.doctor = null;
            if (!payload.verifiedBy) payload.verifiedBy = null;
            if (!payload.patient) payload.patient = null;

            if (formData.id) {
                // Update Mode
                await axios.put(`httpss:/medicmre-eonnect-8rir.vercel.appect-8ris.vercel.app/api/scanner/scan-report/${formData.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Report Updated Successfully!");
            } else {
                // Create Mode
                await axios.post("httpss:/medicmre-eonnect-8rir.vercel.appect-8ris.vercel.app/api/scanner/scan-report", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Report Created Successfully!");
            }
            navigate("/scanner/reports");
        } catch (err) {
            console.error("Failed to save report", err);
            alert("Failed to save report: " + (err.response?.data?.message || err.message));
        }
    };

    // We need a patient selector. For now, I'll put a text input for Patient Object ID 
    // but clearly marking it. In a real app, this is a search dropdown.

    return (
        <>
            <ScannerNavbar />
            <div className="add-report-container">
                <h2>{formData.id ? "Edit Scan Report" : "Create New Scan Report"}</h2>
                <form className="report-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Patient</label>
                        {formData.patientName ? (
                            <div className="read-only-field" style={{ background: '#f1f5f9', padding: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                                <strong>{formData.patientName}</strong> (ID: {formData.patient})
                            </div>
                        ) : (
                            <input
                                type="text"
                                name="patient"
                                value={formData.patient}
                                onChange={handleChange}
                                placeholder="Enter Patient Mongo ID"
                                required
                            />
                        )}
                    </div>

                    <div className="form-group">
                        <label>Assign Doctor</label>
                        <select name="doctor" value={formData.doctor} onChange={handleChange} required>
                            <option value="">Select Doctor</option>
                            {doctors.map(doc => (
                                <option key={doc._id} value={doc._id}>
                                    {doc.name} ({doc.specialization}) - ID: {doc._id.slice(-4)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Scan Type</label>
                        <select name="type" value={formData.type} onChange={handleChange}>
                            <option>X-Ray</option>
                            <option>CT Scan</option>
                            <option>MRI</option>
                            <option>Ultrasound</option>
                            <option>Blood Test</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Scan Name</label>
                        <input
                            type="text"
                            name="scanName"
                            value={formData.scanName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Clinical Indication</label>
                        <textarea
                            name="indication"
                            value={formData.indication}
                            onChange={handleChange}
                            rows="2"
                            placeholder="e.g. Rule out tumor"
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Description/Findings</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Detailed description of the scan..."
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Findings (Detailed)</label>
                        <textarea
                            name="findings"
                            value={formData.findings}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Specific medical findings..."
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Impression</label>
                        <textarea
                            name="impression"
                            value={formData.impression}
                            onChange={handleChange}
                            rows="2"
                            placeholder="e.g. Normal study"
                        ></textarea>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Lab Name</label>
                            <input
                                type="text"
                                name="labName"
                                value={formData.labName}
                                onChange={handleChange}
                                placeholder="e.g. Apollo Diagnostics"
                            />
                        </div>
                        <div className="form-group">
                            <label>Technician Name</label>
                            <input
                                type="text"
                                name="technicianName"
                                value={formData.technicianName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Result Status</label>
                        <select name="resultStatus" value={formData.resultStatus} onChange={handleChange}>
                            <option>Normal</option>
                            <option>Abnormal</option>
                            <option>Critical</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>PDF Report File</label>
                        {formData.pdfFile && typeof formData.pdfFile === 'string' && formData.pdfFile.startsWith('data:') ? (
                            <div className="file-preview">
                                <span>📄 PDF Selected</span>
                                <button type="button" onClick={() => setFormData({ ...formData, pdfFile: "" })} className="btn-remove-file">Remove</button>
                            </div>
                        ) : (
                            <input
                                type="file"
                                name="pdfFile"
                                accept="application/pdf"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({ ...formData, pdfFile: reader.result });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        )}
                        {formData.pdfFile && !formData.pdfFile.startsWith('data:') && (
                            <p className="existing-file-link">
                                Current: <a href={formData.pdfFile} target="_blank" rel="noopener noreferrer">View PDF</a>
                                <button type="button" onClick={() => setFormData({ ...formData, pdfFile: "" })} className="btn-remove-link" style={{ marginLeft: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Change</button>
                            </p>
                        )}
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Scan Date</label>
                            <input
                                type="date"
                                name="scanDate"
                                value={formData.scanDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Report Generated Date</label>
                            <input
                                type="date"
                                name="reportGeneratedDate"
                                value={formData.reportGeneratedDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Cost</label>
                            <input
                                type="number"
                                name="cost"
                                value={formData.cost}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group checkbox-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
                            <input
                                type="checkbox"
                                name="isVerified"
                                id="isVerified"
                                checked={formData.isVerified}
                                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                                style={{ width: 'auto' }}
                            />
                            <label htmlFor="isVerified" style={{ cursor: 'pointer', margin: 0 }}>Mark as Verified {!!formData.doctor && "(Automated)"}</label>
                        </div>

                        {formData.isVerified && (
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Verified By (Doctor)</label>
                                <select
                                    name="verifiedBy"
                                    value={formData.verifiedBy}
                                    onChange={handleChange}
                                    required={formData.isVerified}
                                >
                                    <option value="">Select Verifying Doctor</option>
                                    {doctors.map(doc => (
                                        <option key={doc._id} value={doc._id}>
                                            {doc.name} ({doc.specialization})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="submit-btn">{formData.id ? "Update Report" : "Create Report"}</button>
                </form >
            </div >
        </>
    );
}
