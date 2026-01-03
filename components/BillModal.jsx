import React, { useRef, useEffect } from "react";
import "../styles/Biller/BillModal.css";

const BillModal = ({ bill, onClose, autoPrint = false }) => {
    useEffect(() => {
        if (autoPrint) {
            // Small timeout to ensure DOM is ready
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [autoPrint]);

    if (!bill) return null;

    const printBill = () => {
        window.print();
    };

    // Helper to convert number to words (Simplified for Rupees)
    const toWords = (amount) => {
        const words = [
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
            "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
        ];
        const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

        const numToStr = (n) => {
            if (n < 20) return words[n];
            const digit = n % 10;
            if (n < 100) return tens[Math.floor(n / 10)] + (digit ? " " + words[digit] : "");
            if (n < 1000) return words[Math.floor(n / 100)] + " Hundred" + (n % 100 == 0 ? "" : " And " + numToStr(n % 100));
            return numToStr(Math.floor(n / 1000)) + " Thousand" + (n % 1000 == 0 ? "" : " " + numToStr(n % 1000));
        };

        if (amount === 0) return "Zero";
        return numToStr(amount) + " Only";
    };

    const formatAddress = (addr) => {
        if (!addr) return "-";
        // Handle if address is just a string
        if (typeof addr === 'string') return addr;

        // Handle object structure
        const parts = [
            addr.line1,
            addr.line2,
            addr.city,
            addr.state,
            addr.pincode
        ].filter(part => part && part.trim()); // Remove empty/null values

        return parts.length > 0 ? parts.join(", ") : "-";
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content bill-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header no-print">
                    <h2>Bill Details</h2>
                    <div className="header-actions">
                        <button onClick={printBill} className="print-btn">🖨️ Print</button>
                        <button onClick={onClose} className="close-btn">×</button>
                    </div>
                </div>

                <div className="bill-print-area" id="printable-bill">
                    {/* Brand Header */}
                    <div className="brand-header">
                        <div className="logo-section">
                            {/* Placeholder for Logo */}
                            <div className="logo-placeholder">🏥</div>
                            <div className="hospital-title">
                                <h1>NS multispeciality hospital</h1>
                                <div className="iso-tag">ISO 9001:2015 Certified</div>
                            </div>
                        </div>
                        <div className="hospital-contact">
                            <p>Outer Ring Road, Marathahalli, Bangalore - 560103</p>
                            <p>Helpline: +91 80 4969 4969</p>
                            <p>info@sakraworldhospital.com</p>
                        </div>
                    </div>

                    <div className="receipt-strip">
                        Payment Receipt
                    </div>

                    {/* Meta Info Grid */}
                    <div className="meta-info-grid">
                        <div className="meta-left">
                            <div className="row"><span className="label">Receipt No:</span> <span className="val bold">{bill._id.slice(-6).toUpperCase()}</span></div>
                            <div className="row"><span className="label">UHID:</span> <span className="val">{bill.patient?.mrn || '-'}</span></div>
                            <div className="row"><span className="label">Name:</span> <span className="val bold">{bill.patient?.name}</span></div>
                            <div className="row"><span className="label">Age/Gen:</span> <span className="val">{bill.patient?.age}Y / {bill.patient?.gender}</span></div>
                            <div className="row"><span className="label">Mobile No.:</span> <span className="val">{bill.patient?.phone}</span></div>
                            <div className="row"><span className="label">Address:</span> <span className="val">{formatAddress(bill.patient?.address)}</span></div>
                        </div>
                        <div className="meta-right">
                            <div className="row"><span className="label">Date & Time:</span> <span className="val">{new Date(bill.createdAt).toLocaleString()}</span></div>

                            <div className="row"><span className="label">Department:</span> <span className="val">{bill.treatment || 'General'}</span></div>
                            <div className="row"><span className="label">Doctor:</span> <span className="val bold">{bill.doctor?.name}</span></div>
                            <div className="row"><span className="label">User:</span> <span className="val">Admin</span></div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        <table className="receipt-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>S.No.</th>
                                    <th style={{ width: '80px' }}>Code</th>
                                    <th>Particular</th>
                                    <th style={{ width: '100px', textAlign: 'right' }}>Rate (Rs)</th>
                                    <th style={{ width: '60px', textAlign: 'center' }}>Unit</th>
                                    <th style={{ width: '120px', textAlign: 'right' }}>Amount (Rs)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bill.billItems?.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{100 + index}</td> {/* Mock Code */}
                                        <td className="bold">{item.name}</td>
                                        <td style={{ textAlign: 'right' }}>{item.charge.toFixed(2)}</td>
                                        <td style={{ textAlign: 'center' }}>{item.qty}</td>
                                        <td style={{ textAlign: 'right' }}>{(item.qty * item.charge).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Summary Box */}
                    <div className="footer-summary">
                        <div className="summary-row">
                            <span className="label">Payment Mode</span>
                            <span className="amount">{bill.paymentMode}</span>
                        </div>
                        <div className="summary-row">
                            <span className="label">Total Bill Amount (Rs)</span>
                            <span className="amount">{bill.amount.toFixed(2)}</span>
                        </div>
                        <div className="summary-row highlight">
                            <span className="label text-left">Amount Paid (Rupees {toWords(bill.amount)})</span>
                            <span className="amount">{bill.amount.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span className="label">Total Amount Paid (Rs)</span>
                            <span className="amount">{bill.amount.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span className="label">Balance Amount (Rs)</span>
                            <span className="amount">0.00</span>
                        </div>
                    </div>

                    <div className="auth-sign">
                        <p>Authorized Signature</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BillModal;
