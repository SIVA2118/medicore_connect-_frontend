import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Biller/BillHistory.css";
import BillModal from "../../components/BillModal";

const BillHistory = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBill, setSelectedBill] = useState(null);
    const [autoPrint, setAutoPrint] = useState(false);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("https://medicore-connect.onrender.com/api/biller/all-bills", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBills(res.data.bills || []);
        } catch (error) {
            console.error("Failed to fetch bill history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (bill) => {
        setSelectedBill(bill);
        setAutoPrint(false);
    };

    const handlePrint = (bill) => {
        setSelectedBill(bill);
        setAutoPrint(true);
    };

    const handleGeneratePDF = async (bill) => {
        const token = localStorage.getItem("token");

        try {
            // 1. Download PDF (Desktop Backup)
            const pdfRes = await axios.post("https://medicore-connect.onrender.com/api/biller/generate-pdf",
                { billId: bill._id },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Bill-${bill._id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("PDF Download failed", error);
            // Continue to WhatsApp attempt
        }

        try {
            // 2. Open WhatsApp Window (Client View)
            if (bill.patient?.phone) {
                const rawPhone = bill.patient.phone.replace(/\D/g, "");
                const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

                const pdfLink = `https://medicore-connect.onrender.com/api/biller/view-pdf/${bill._id}`;

                const message = encodeURIComponent(
                    `Hello ${bill.patient.name}, here is your bill for treatment "${bill.treatment}".\n\n📄 View PDF: ${pdfLink}\n\nFor queries, contact 9942129724.`
                );

                window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
            }

            // 3. Auto-Send via Server (The "Auto Attach" Logic)
            await axios.post("https://medicore-connect.onrender.com/api/biller/send-whatsapp",
                { billId: bill._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Alert for successful server send + instructions for manual send
            alert(`✅ System sent the bill automatically via API!\n\n⚠️ BROWSER LIMITATION: Files cannot be auto-attached to the WhatsApp window we opened.\n\n👉 HANDS ON: To send it personally, please DRAG & DROP the downloaded PDF into the chat.`);

        } catch (error) {
            console.error("Server Send failed", error);
            // Alert if server failed, emphasizing manual step
            alert(`⚠️ Automatic Send Failed.\n\n👉 ACTION REQUIRED: WhatsApp Window is open. Please DRAG & DROP the downloaded file into the chat to send it manually.`);
        }
    };

    const handleSendWhatsApp = (bill) => {
        if (bill.patient?.phone) {
            const rawPhone = bill.patient.phone.replace(/\D/g, "");
            const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

            const message = encodeURIComponent(
                `Hello ${bill.patient.name}, here is your bill for treatment "${bill.treatment}".\n\nFor queries, contact 9942129724.`
            );

            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        } else {
            alert("Patient has no phone number.");
        }
    };

    const filteredBills = bills.filter(bill => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            bill._id.toLowerCase().includes(searchLower) ||
            (bill.patient?.name || "").toLowerCase().includes(searchLower) ||
            (bill.patient?.mrn || "").toLowerCase().includes(searchLower);

        const matchesDate = filterDate
            ? new Date(bill.createdAt).toDateString() === new Date(filterDate).toDateString()
            : true;

        return matchesSearch && matchesDate;
    });

    if (loading) return <div className="bill-history-page">Loading history...</div>;

    return (
        <div className="bill-history-page">
            <div className="history-card">
                <header className="history-header">
                    <div>
                        <h2 className="history-title">Billing history</h2>
                        <p className="history-subtitle">Manage your billing plan and receipts here</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            style={{
                                padding: '0.6rem 1rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                background: '#f8fafc',
                                color: '#64748b'
                            }}
                        />
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search invoice..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <div className="table-responsive">
                    <table className="clean-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Bill ID</th>
                                <th>Patient ID</th>
                                <th>Patient Name</th>
                                <th>Doctor</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBills.length > 0 ? (
                                filteredBills.map(bill => (
                                    <tr key={bill._id}>
                                        <td className="date-cell">{new Date(bill.createdAt).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                        <td>
                                            <div className="invoice-cell">
                                                <div className="file-icon">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M14 2V8H20" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M16 13H8" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M16 17H8" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M10 9H9H8" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                                <span className="invoice-id">#{bill._id.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 500, color: '#64748b' }}>{bill.patient?.mrn || "N/A"}</td>
                                        <td className="patient-name">{bill.patient?.name}</td>
                                        <td className="text-gray">{bill.doctor?.name || "-"}</td>
                                        <td>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: bill.patient?.patientType === 'IPD' ? '#e0e7ff' : '#f0f9ff',
                                                color: bill.patient?.patientType === 'IPD' ? '#4338ca' : '#0369a1',
                                                fontSize: '0.8rem',
                                                fontWeight: 600
                                            }}>
                                                {bill.patient?.patientType || "OPD"}
                                            </span>
                                        </td>
                                        <td className="amount-cell">₹{bill.amount.toLocaleString()}</td>
                                        <td>
                                            <span className={`status-pill ${bill.paid ? 'paid' : 'pending'}`}>
                                                {bill.paid ? "Completed" : "Pending"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-flex">
                                                <button onClick={() => handleView(bill)} title="View" className="icon-btn">👁️</button>
                                                <button onClick={() => handlePrint(bill)} title="Print" className="icon-btn">🖨️</button>
                                                <button onClick={() => handleGeneratePDF(bill)} title="Download PDF" className="icon-btn">⬇️</button>
                                                <button onClick={() => handleSendWhatsApp(bill)} title="WhatsApp" className="icon-btn">📱</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="empty-state">No bills found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedBill && (
                <BillModal
                    bill={selectedBill}
                    autoPrint={autoPrint}
                    onClose={() => setSelectedBill(null)}
                />
            )}
        </div>
    );
};

export default BillHistory;
