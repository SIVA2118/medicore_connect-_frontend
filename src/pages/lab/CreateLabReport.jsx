import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import LabNavbar from "../../components/LabNavbar";
import { LAB_TEST_MASTER } from "../../constants/labTestMaster";
import "../../styles/lab/CreateLabReport.css";

export default function CreateLabReport() {
    const navigate = useNavigate();
    const location = useLocation();
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        id: "",
        patient: "",
        doctor: "",
        patientName: "",
        testType: "Hematology",
        testName: "",
        description: "",
        resultDetails: "",
        labName: "",
        technicianName: "",
        resultStatus: "Normal",
        pdfFile: "",
        reportGeneratedDate: new Date().toISOString().split("T")[0],
        testDate: new Date().toISOString().split("T")[0],
        cost: 0,
        isVerified: false,
        verifiedBy: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const [doctorsRes, profileRes] = await Promise.all([
                    axios.get("https://medicore-connect.onrender.com/api/lab/all-doctors", { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get("https://medicore-connect.onrender.com/api/lab/profile", { headers: { Authorization: `Bearer ${token}` } })
                ]);

                if (doctorsRes.data.success) {
                    setDoctors(doctorsRes.data.doctors);
                }

                // If creating a new report (no ID), auto-fill technician details
                if (profileRes.data && !formData.id) {
                    setFormData(prev => ({
                        ...prev,
                        technicianName: profileRes.data.name,
                        labName: profileRes.data.department || "General Lab"
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch initial data", err);
            }
        };
        fetchData();
    }, []); // Removed formData.id dependency to avoid overwrite loops, handled inside info check

    useEffect(() => {
        if (location.state?.report) {
            const r = location.state.report;
            setFormData(prev => ({
                ...prev,
                id: r._id,
                patient: r.patient?._id || r.patient || "",
                patientName: r.patient?.name || "",
                doctor: r.doctor?._id || r.doctor || "",
                testType: r.testType || "Hematology",
                testName: r.testName || "",
                description: r.description || "",
                resultDetails: r.resultDetails || "",
                labName: r.labName || "",
                technicianName: r.technicianName || "",
                resultStatus: r.resultStatus || "Pending",
                pdfFile: r.pdfFile || "",
                reportGeneratedDate: r.reportGeneratedDate ? r.reportGeneratedDate.split("T")[0] : new Date().toISOString().split("T")[0],
                cost: r.cost || 0,
                testDate: r.testDate ? r.testDate.split("T")[0] : new Date().toISOString().split("T")[0],
                isVerified: r.isVerified || false,
                verifiedBy: r.verifiedBy?._id || r.verifiedBy || ""
            }));
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "testType") {
            // Reset test name when type changes
            setFormData({
                ...formData,
                testType: value,
                testName: LAB_TEST_MASTER[value]?.[0] || ""
            });
        } else if (name === "verifiedBy") {
            if (value) {
                setFormData({
                    ...formData,
                    verifiedBy: value,
                    isVerified: true
                });
            } else {
                setFormData({
                    ...formData,
                    verifiedBy: "",
                    isVerified: false
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
            const payload = { ...formData };

            if (!payload.doctor) payload.doctor = null;
            if (!payload.verifiedBy) payload.verifiedBy = null;
            if (!payload.patient) payload.patient = null;

            if (formData.id) {
                await axios.put(`https://medicore-connect.onrender.com/api/lab/report/${formData.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Report Processed & Updated Successfully!");
            } else {
                await axios.post("https://medicore-connect.onrender.com/api/lab/report", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Report Created Successfully!");
            }
            navigate("/lab/reports");
        } catch (err) {
            console.error("Failed to save report", err);
            alert("Failed to save report");
        }
    };

    return (
        <>
            <LabNavbar />
            <div className="add-report-container">
                <h2>{formData.id ? "Process Lab Report" : "Create New Lab Report"}</h2>
                <form className="report-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Patient</label>
                        <div className="read-only-field" style={{ background: '#f1f5f9', padding: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                            <strong>{formData.patientName || "Unknown"}</strong> (ID: {formData.patient})
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Assigned Doctor</label>
                        <div className="read-only-field" style={{ background: '#f1f5f9', padding: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                            {doctors.find(d => d._id === formData.doctor)?.name || "Unassigned"}
                        </div>
                    </div>


                    <div className="form-group">
                        <label>Test Type</label>
                        <select
                            name="testType"
                            value={formData.testType}
                            onChange={handleChange}
                            disabled={!!formData.id}
                        >
                            {Object.keys(LAB_TEST_MASTER).map(key => (
                                <option key={key} value={key}>{key.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Test Name</label>
                        <select
                            name="testName"
                            value={formData.testName}
                            onChange={handleChange}
                            required
                            disabled={!!formData.id}
                        >
                            <option value="">Select Test</option>
                            {LAB_TEST_MASTER[formData.testType]?.map(test => (
                                <option key={test} value={test}>{test}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description / Notes</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Result Details (Findings)</label>
                        <textarea
                            name="resultDetails"
                            value={formData.resultDetails}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Enter detailed results here..."
                        ></textarea>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Lab / Department</label>
                            <input
                                type="text"
                                name="labName"
                                value={formData.labName}
                                readOnly
                                style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Technician Name</label>
                            <input
                                type="text"
                                name="technicianName"
                                value={formData.technicianName}
                                readOnly
                                style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Result Status</label>
                        <select name="resultStatus" value={formData.resultStatus} onChange={handleChange}>
                            <option>Normal</option>
                            <option>Abnormal</option>
                            <option>Critical</option>
                            <option>Pending</option>
                        </select>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Test Date</label>
                            <input type="date" name="testDate" value={formData.testDate} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Cost</label>
                            <input type="number" name="cost" value={formData.cost} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group" style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                        <label style={{ color: '#166534', marginBottom: '0.5rem' }}>Verification</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input
                                type="checkbox"
                                checked={formData.isVerified}
                                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <span>Mark as Verified</span>
                        </div>
                        {formData.isVerified && (
                            <div style={{ marginTop: '1rem' }}>
                                <label>Verified By (Doctor)</label>
                                <select name="verifiedBy" value={formData.verifiedBy} onChange={handleChange} required>
                                    <option value="">Select Doctor</option>
                                    {doctors.map(d => (
                                        <option key={d._id} value={d._id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="submit-btn">
                        {formData.id ? "Update & Process Report" : "Create Report"}
                    </button>
                </form>
            </div>
        </>
    );
}
