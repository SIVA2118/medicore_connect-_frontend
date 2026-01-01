import { useState, useEffect } from "react";
import axios from "axios";
import LabNavbar from "../../components/LabNavbar";
import "../../styles/lab/Patient.css";

export default function Patient() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("https://medicore-connect.onrender.com/api/lab/all-patients", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setPatients(res.data.patients || []);
            }
        } catch (err) {
            console.error("Failed to fetch patients", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mrn?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <LabNavbar />
            <div className="lab-patients-container">
                <h2>Patient Directory</h2>

                <div className="patient-search-bar">
                    <input
                        type="text"
                        placeholder="Search patients by name or ID..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? <p>Loading patients...</p> : (
                    <div className="patient-list-grid">
                        {filteredPatients.map(patient => (
                            <div key={patient._id} className="lab-patient-card">
                                <div className="patient-avatar">
                                    {patient.name.charAt(0)}
                                </div>
                                <div className="patient-details">
                                    <h4>{patient.name}</h4>
                                    <span>{patient.age} Years • {patient.gender}</span>
                                    <span style={{ fontSize: '0.8rem' }}>ID: {patient.mrn}</span>
                                    {patient.assignedByDoc && (
                                        <div style={{ marginTop: '0.5rem', padding: '4px 8px', background: '#e0e7ff', borderRadius: '4px', fontSize: '0.8rem', color: '#3730a3', display: 'inline-block' }}>
                                            Assigned by: <strong>{patient.assignedByDoc.name}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
