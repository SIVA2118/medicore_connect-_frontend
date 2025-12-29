import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Doctor/DoctorProfile.css";
import DoctorNavbar from "../../components/DoctorNavbar"; // Assuming you will create or reuse a Navbar

export default function DoctorProfile() {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("https://medicore-connect.onrender.com/api/doctor/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctor(res.data);
        } catch (err) {
            console.error("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };


    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Convert to Base64
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64Image = reader.result;
            try {
                const token = localStorage.getItem("token");
                await axios.put("https://medicore-connect.onrender.com/api/doctor/profile",
                    { profileImage: base64Image },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Update local state
                setDoctor(prev => ({ ...prev, profileImage: base64Image }));
                alert("Profile image updated!");
            } catch (err) {
                console.error(err);
                alert("Failed to update image");
            }
        };
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <>
            <DoctorNavbar />
            <div className="doctor-profile-container">
                <div className="id-card-wrapper">
                    <div className="id-card new-design">
                        {/* Background Shapes */}
                        <div className="bg-shape-top"></div>
                        <div className="bg-shape-bottom"></div>

                        <div className="card-content">
                            <div className="card-header-top">
                                <div className="hospital-brand">
                                    <div className="brand-icon">+</div>
                                    <div className="brand-text">
                                        <span>SAKRA WORLD</span>
                                        <span>HOSPITAL</span>
                                    </div>
                                </div>
                            </div>

                            <div className="photo-section">
                                <div className="photo-ring">
                                    <label htmlFor="profile-upload" className="upload-overlay">
                                        <input
                                            id="profile-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                        />
                                        <img
                                            src={doctor?.profileImage || "https://static.vecteezy.com/system/resources/previews/019/879/186/non_2x/user-icon-on-transparent-background-free-png.png"}
                                            alt="Doctor Profile"
                                            title="Click to update photo"
                                        />
                                        <span className="edit-icon">✏️</span>
                                    </label>
                                </div>
                            </div>

                            <div className="intro-section">
                                <h2 className="doc-name">{doctor?.name}</h2>
                                <p className="doc-title">{doctor?.specialization}</p>
                            </div>

                            <div className="info-table">
                                <div className="info-row">
                                    <span className="info-label">ID NUMBER:</span>
                                    <span className="info-val">{doctor?.registrationNumber || "N/A"}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">PHONE NO:</span>
                                    <span className="info-val">{doctor?.phone || "N/A"}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">DEPT:</span>
                                    <span className="info-val">{doctor?.specialization}</span>
                                </div>
                            </div>

                            <div className="bottom-badge">
                                <span>DOCTOR</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
