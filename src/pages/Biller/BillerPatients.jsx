import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/Biller/BillerPatients.css";

const BillerPatients = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState("");

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [filterDate, patients]);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("https://medicore-connect.onrender.com/api/biller/patients", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(res.data.patients || []);
        } catch (error) {
            console.error("Failed to fetch patients", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = () => {
        let result = [...patients];

        if (filterDate) {
            const selectedDateStr = new Date(filterDate).toDateString();
            result = result.filter(p => new Date(p.createdAt).toDateString() === selectedDateStr);
        }

        // Sort by newest first
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFilteredPatients(result);
    };

    const handleCreateBill = (patientId) => {
        const patient = patients.find(p => p._id === patientId);
        const doctorId = patient?.assignedDoctor?._id || patient?.assignedDoctor;
        navigate("/biller/create", { state: { patientId, doctorId } });
    };

    const ipdPatients = filteredPatients.filter(p => p.patientType === "IPD");
    const opdPatients = filteredPatients.filter(p => !p.patientType || p.patientType === "OPD");

    if (loading) return <div className="biller-loading">Loading patients...</div>;

    const PatientCard = ({ patient }) => (
        <div className="patient-card-biller">
            <div className="patient-header">
                <div className="patient-avatar">
                    {patient.name.charAt(0).toUpperCase()}
                </div>
                <div className="patient-info">
                    <h3 title={patient.name}>{patient.name}</h3>
                    <p>{patient.gender || "N/A"}, {patient.age || "?"} • #{patient.mrn || "ID"}</p>
                    <p className="patient-contact">📞 {patient.phone || "No Phone"}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        Reg: {new Date(patient.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <button
                className="btn-create-bill"
                onClick={() => handleCreateBill(patient._id)}
            >
                Create Bill
            </button>
        </div>
    );

    return (
        <div className="biller-patients-container">
            <header className="dashboard-header" style={{ marginBottom: "1rem", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Registered Patients</h1>
                    <p>{filterDate ? new Date(filterDate).toDateString() : "All Patients"}</p>
                </div>
                <div>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="form-input"
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}
                    />
                </div>
            </header>

            <div className="split-container">
                {/* OPD COLUMN */}
                <div className="patient-column">
                    <div className="column-header">
                        <span>🏥</span> OPD Patients ({opdPatients.length})
                    </div>
                    <div className="patients-list">
                        {opdPatients.length > 0 ? (
                            opdPatients.map(p => <PatientCard key={p._id} patient={p} />)
                        ) : (
                            <div className="no-patients">No OPD Patients found {filterDate && "for this date"}</div>
                        )}
                    </div>
                </div>

                {/* IPD COLUMN */}
                <div className="patient-column">
                    <div className="column-header">
                        <span>🛏️</span> IPD Patients ({ipdPatients.length})
                    </div>
                    <div className="patients-list">
                        {ipdPatients.length > 0 ? (
                            ipdPatients.map(p => <PatientCard key={p._id} patient={p} />)
                        ) : (
                            <div className="no-patients">No IPD Patients found {filterDate && "for this date"}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillerPatients;
