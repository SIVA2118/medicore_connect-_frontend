import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Biller/CreateBill.css";

const CreateBill = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [isPatientLocked, setIsPatientLocked] = useState(false);
    const [isDoctorLocked, setIsDoctorLocked] = useState(false);

    const [formData, setFormData] = useState({
        patientId: "",
        doctorId: "",
        treatment: "",
        billItems: [],
        scanReportIds: [],
        reportId: ""
    });

    const [newItem, setNewItem] = useState({ name: "", charge: "", qty: 1 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDropdowns();
    }, []);

    // Effect to handle pre-filled patient from navigation state
    useEffect(() => {
        if (location.state?.patientId) {
            setFormData(prev => ({
                ...prev,
                patientId: location.state.patientId
            }));
            setIsPatientLocked(true);
        }
        if (location.state?.doctorId) {
            setFormData(prev => ({
                ...prev,
                doctorId: location.state.doctorId
            }));
            setIsDoctorLocked(true);
        }
    }, [location.state]);

    // Auto-fetch prescription when patient is selected
    useEffect(() => {
        if (!formData.patientId) return;

        const fetchPrescription = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`https://medicore-connect.onrender.com/api/biller/prescription/${formData.patientId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success && res.data.prescription) {
                    const medicines = res.data.prescription.medicines || [];
                    if (medicines.length > 0) {
                        const newItems = medicines.map(med => ({
                            name: `${med.name} (${med.dosage})`,
                            charge: 0, // Default charge, can be updated
                            qty: med.duration ? parseInt(med.duration.split(' ')[0]) || 1 : 1,
                            isPrescription: true // Flag to lock editing
                        }));

                        setFormData(prev => {
                            // Filter out old prescription items/headers to prevent duplicates
                            const cleanItems = prev.billItems.filter(i => !i.isPrescription && !i.isHeader);
                            return {
                                ...prev,
                                billItems: [
                                    ...cleanItems,
                                    { name: "--- Medi Prescription ---", charge: 0, qty: 0, isHeader: true },
                                    ...newItems
                                ],
                                prescriptionId: res.data.prescription._id,
                                treatment: prev.treatment || "Pharmacy Bill" // Auto-fill treatment
                            };
                        });
                    }
                }
            } catch (error) {
                console.error("No prescription found or error fetching", error);
            }
        };

        fetchPrescription();
    }, [formData.patientId]);

    // Auto-fetch Latest General Checkup Report
    useEffect(() => {
        if (!formData.patientId) return;

        const fetchReport = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`https://medicore-connect.onrender.com/api/biller/report/${formData.patientId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success && res.data.report) {
                    setFormData(prev => ({
                        ...prev,
                        reportId: res.data.report._id
                    }));
                    console.log("Linked Report:", res.data.report._id);
                }
            } catch (error) {
                console.error("No report found or error fetching", error);
            }
        };

        fetchReport();
    }, [formData.patientId]);

    // Auto-fetch Unbilled Scan Reports
    useEffect(() => {
        if (!formData.patientId) return;

        const fetchScanReports = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`https://medicore-connect.onrender.com/api/biller/unbilled-scan-reports/${formData.patientId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success && res.data.reports) {
                    const reports = res.data.reports;

                    if (reports.length > 0) {
                        setFormData(prev => {
                            // Remove existing scan items to avoid duplicates if re-fetching
                            const cleanItems = prev.billItems.filter(i => !i.isScanCost);

                            const newScanItems = reports.map(report => ({
                                name: `Scan Cost - ${report.scanName}`,
                                charge: report.cost,
                                qty: 1,
                                isScanCost: true,
                                isPrescription: false,
                                scanReportId: report._id // Track ID for filtering later if needed
                            }));

                            return {
                                ...prev,
                                billItems: [...cleanItems, ...newScanItems],
                                scanReportIds: reports.map(r => r._id), // Store all IDs
                                treatment: prev.treatment || `Scan Payment - ${reports[0].scanName}` // Auto-fill treatment
                            };
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching scan reports", error);
            }
        };

        fetchScanReports();
    }, [formData.patientId]);

    // Auto-add consultation fee when doctor is selected
    useEffect(() => {
        if (!formData.doctorId || doctors.length === 0) return;

        const selectedDoctor = doctors.find(d => d._id === formData.doctorId);
        if (selectedDoctor && selectedDoctor.consultationFee !== undefined) {
            setFormData(prev => {
                const feeItemIndex = prev.billItems.findIndex(item => item.isConsultation);
                let newItems = [...prev.billItems];

                if (feeItemIndex >= 0) {
                    // Update existing fee
                    newItems[feeItemIndex] = {
                        ...newItems[feeItemIndex],
                        charge: selectedDoctor.consultationFee
                    };
                } else {
                    // Add new fee item
                    newItems.unshift({ // Add to top
                        name: "Consultation Fee",
                        charge: selectedDoctor.consultationFee,
                        qty: 1,
                        isConsultation: true,
                        isPrescription: true // Lock editing for this too? Or let them edit? User wanted "Doctor fees" added, usually strict. Let's make it strict like prescription to prevent tampering, or let them edit? Plan said "Manual Override: Ensure user can still edit". So I won't set isPrescription=true. 
                        // Actually, let's keep it editable as per plan. 
                    });
                }
                return {
                    ...prev,
                    billItems: newItems,
                    treatment: prev.treatment || `Consultation - Dr. ${selectedDoctor.name}` // Auto-fill treatment
                };
            });
        }
    }, [formData.doctorId, doctors]);

    const fetchDropdowns = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token} ` } };

            const [patRes, docRes] = await Promise.all([
                axios.get("https://medicore-connect.onrender.com/api/biller/patients", config),
                axios.get("https://medicore-connect.onrender.com/api/biller/doctors", config)
            ]);

            setPatients(patRes.data.patients || []);
            setDoctors(docRes.data.doctors || []);
        } catch (error) {
            console.error("Failed to fetch dropdown data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        if (!newItem.name || !newItem.charge) return;
        setFormData({
            ...formData,
            billItems: [...formData.billItems, newItem]
        });
        setNewItem({ name: "", charge: "", qty: 1 });
    };

    const handleRemoveItem = (index) => {
        const updated = formData.billItems.filter((_, i) => i !== index);
        setFormData({ ...formData, billItems: updated });
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.billItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setFormData({ ...formData, billItems: updatedItems });
    };

    const totalAmount = formData.billItems.reduce((acc, item) => acc + (item.charge * item.qty), 0);

    const handleSubmit = async () => {
        if (!formData.patientId) return alert("Please select a Patient");
        if (!formData.doctorId) return alert("Please select a Doctor");
        if (!formData.treatment) return alert("Please enter Treatment/Reason");
        if (formData.billItems.length === 0) return alert("Bill must have at least one item");

        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token} ` } };

            await axios.post("https://medicore-connect.onrender.com/api/biller/create-bill", formData, config);

            alert("Bill Generated Successfully!");
            navigate("/biller");
        } catch (error) {
            console.error("Error creating bill:", error);
            alert(error.response?.data?.message || "Failed to create bill");
        }
    };

    if (loading) return <div className="create-bill-container">Loading...</div>;

    return (
        <div className="create-bill-container">
            <header className="dashboard-header">
                <h1>Create New Bill</h1>
            </header>

            <div className="bill-card">
                <div className="section-title">Patient & Doctor Details</div>
                <div className="form-grid">
                    <div className="input-grp">
                        <label>Select Patient</label>
                        <select
                            value={formData.patientId}
                            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                            disabled={isPatientLocked}
                            className={isPatientLocked ? "locked-input" : ""}
                        >
                            <option value="">-- Select Patient --</option>
                            {patients.map(p => (
                                <option key={p._id} value={p._id}>
                                    {p.name} ({p.phone || "N/A"})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="input-grp">
                        <label>Select Doctor</label>
                        <select
                            value={formData.doctorId}
                            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                            disabled={isDoctorLocked}
                            className={isDoctorLocked ? "locked-input" : ""}
                        >
                            <option value="">-- Select Doctor --</option>
                            {doctors.map(d => (
                                <option key={d._id} value={d._id}>
                                    Dr. {d.name} ({d.specialization})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="section-title">Treatment Info</div>
                <div className="input-grp" style={{ marginBottom: '2rem' }}>
                    <label>Treatment / Reason</label>
                    <input
                        placeholder="General Consultation, X-Ray, etc."
                        value={formData.treatment}
                        onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                    />
                </div>

                <div className="section-title">Bill Items</div>
                <table className="bill-items-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40%' }}>Item Name</th>
                            <th style={{ width: '20%' }}>Cost (₹)</th>
                            <th style={{ width: '20%' }}>Qty</th>
                            <th style={{ width: '20%' }}>Total</th>
                            <th style={{ width: '50px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.billItems.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: "center", color: "#888" }}>No items added</td></tr>
                        )}
                        {formData.billItems.map((item, index) => (
                            <tr key={index} style={item.isHeader ? { background: '#f8fafc', fontWeight: 600 } : {}}>
                                {item.isHeader ? (
                                    <td colSpan="5" style={{ padding: '1rem', color: '#0f172a' }}>{item.name}</td>
                                ) : (
                                    <>
                                        <td>
                                            <input
                                                value={item.name}
                                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                className={`table-input ${item.isPrescription || item.isScanCost ? 'locked-input' : ''}`}
                                                disabled={item.isPrescription || item.isScanCost}
                                                title={item.isPrescription || item.isScanCost ? "This item name cannot be changed" : ""}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={item.charge}
                                                onChange={(e) => handleItemChange(index, 'charge', parseFloat(e.target.value) || 0)}
                                                className="table-input"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={item.qty}
                                                onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 1)}
                                                className={`table-input ${item.isPrescription || item.isScanCost ? 'locked-input' : ''}`}
                                                disabled={item.isPrescription || item.isScanCost}
                                                title={item.isPrescription || item.isScanCost ? "This item quantity cannot be changed" : ""}
                                            />
                                        </td>
                                        <td>₹{(item.charge * item.qty).toLocaleString()}</td>
                                        <td>
                                            <button
                                                onClick={() => handleRemoveItem(index)}
                                                style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}
                                                title="Remove Item"
                                            >❌</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="form-grid" style={{ gridTemplateColumns: "2fr 1fr 1fr auto", alignItems: "end", gap: "1rem" }}>
                    <div className="input-grp">
                        <input
                            placeholder="Item Name"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        />
                    </div>
                    <div className="input-grp">
                        <input
                            type="number"
                            placeholder="Cost"
                            value={newItem.charge}
                            onChange={(e) => setNewItem({ ...newItem, charge: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="input-grp">
                        <input
                            type="number"
                            placeholder="Qty"
                            value={newItem.qty}
                            onChange={(e) => setNewItem({ ...newItem, qty: parseInt(e.target.value) || 1 })}
                        />
                    </div>
                    <button className="btn-add-item" onClick={handleAddItem}>+ Add</button>
                </div>

                <div className="total-section">
                    <div className="total-row">
                        <span className="total-label">Payment Mode:</span>
                        <select
                            className="payment-select"
                            value={formData.paymentMode || "Cash"}
                            onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', marginLeft: '10px' }}
                        >
                            <option value="Cash">Cash 💵</option>
                            <option value="Card">Card 💳</option>
                            <option value="UPI">UPI 📱</option>
                        </select>
                    </div>
                    <div className="total-row">
                        <span className="total-label">Grand Total:</span>
                        <span className="total-value">₹{totalAmount.toLocaleString()}</span>
                    </div>
                </div>

                <div className="actions-row">
                    <button className="btn-discard" onClick={() => navigate("/biller")}>Discard</button>
                    <button className="btn-generate" onClick={handleSubmit}>Generate Bill</button>
                </div>
            </div>
        </div>
    );
};

export default CreateBill;
