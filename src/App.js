import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyPatient from "./pages/Public/VerifyPatient";

// Dashboards
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import ReceptionistDashboard from "./pages/dashboards/ReceptionistDashboard";
import DoctorDashboard from "./pages/dashboards/DoctorDashboard";
import ScannerDashboard from "./pages/dashboards/ScannerDashboard";
import LabTechnicianDashboard from "./pages/dashboards/LabTechnicianDashboard";
import LabReportPage from "./pages/lab/Report";
import Tests from "./pages/lab/Tests";
import Patient from "./pages/lab/Patient";
import CreateLabReport from "./pages/lab/CreateLabReport";
import ViewLabReport from "./pages/lab/ViewLabReport";
import LabTests from "./pages/lab/LabTests";
import ScanReports from "./pages/Scanner/ScanReports";
import CreateScanReport from "./pages/Scanner/CreateScanReport";
// Biller pages
import BillerDashboard from "./pages/Biller/BillerDashboard";
import CreateBill from "./pages/Biller/CreateBill";
import BillHistory from "./pages/Biller/BillHistory";
import BillerPatients from "./pages/Biller/BillerPatients";
import TotalCollection from "./pages/Biller/TotalCollection";
import TodaysCollection from "./pages/Biller/TodaysCollection";

// Admin pages
import DoctorsPage from "./pages/admin/DoctorsPage";
import ReceptionistsPage from "./pages/admin/ReceptionistsPage";
import ScannersPage from "./pages/admin/ScannersPage";
import BillersPage from "./pages/admin/BillersPage";
import ReportsPage from "./pages/admin/ReportsPage";

// Receptionist pages
import AddPatient from "./pages/Receptionist/AddPatient";
import PatientList from "./pages/Receptionist/PatientList";
import AssignedDoctors from "./pages/Receptionist/AssignedDoctors";

// Doctor pages
import MyPatients from "./pages/Doctor/MyPatients";
import PatientDetails from "./pages/Doctor/PatientDetails";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import Availability from "./pages/Doctor/Availability";
import Report from "./pages/Doctor/Report";
import Prescriptions from "./pages/Doctor/Prescriptions";
import SelectPatientForReport from "./pages/Doctor/SelectPatientForReport";
import AllPrescriptions from "./pages/Doctor/AllPrescriptions";
import ViewReport from "./pages/Doctor/ViewReport";
import ViewScanReport from "./pages/Doctor/ViewScanReport";
import ViewPrescription from "./pages/Doctor/ViewPrescription";
import DoctorLayout from "./components/DoctorLayout";
import BillerLayout from "./components/BillerLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* PUBLIC VERIFICATION */}
        <Route path="/verify-patient" element={<VerifyPatient />} />

        {/* DASHBOARDS */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receptionist"
          element={
            <ProtectedRoute role="receptionist">
              <ReceptionistDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receptionist/add-patient"
          element={
            <ProtectedRoute role="receptionist">
              <AddPatient />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receptionist/patients"
          element={
            <ProtectedRoute role="receptionist">
              <PatientList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receptionist/doctors"
          element={
            <ProtectedRoute role="receptionist">
              <AssignedDoctors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor"
          element={
            <ProtectedRoute role="doctor">
              <DoctorLayout>
                <DoctorDashboard />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/scanner"
          element={
            <ProtectedRoute role="scanner">
              <ScannerDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/scanner/dashboard" element={<ProtectedRoute role="scanner"><ScannerDashboard /></ProtectedRoute>} />
        <Route path="/scanner/reports" element={<ProtectedRoute role="scanner"><ScanReports /></ProtectedRoute>} />
        <Route path="/scanner/scan-report/view/:reportId" element={<ProtectedRoute role="scanner"><ViewScanReport /></ProtectedRoute>} />
        <Route path="/scanner/create-report" element={<ProtectedRoute role="scanner"><CreateScanReport /></ProtectedRoute>} />

        {/* LAB DASHBOARD */}
        <Route
          path="/lab"
          element={
            <ProtectedRoute role="lab">
              <LabTechnicianDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/lab/dashboard" element={<ProtectedRoute role="lab"><LabTechnicianDashboard /></ProtectedRoute>} />
        <Route path="/lab/reports" element={<ProtectedRoute allowedRoles={["lab"]}><LabReportPage /></ProtectedRoute>} />
        <Route path="/lab/Tests" element={<ProtectedRoute allowedRoles={["lab", "admin", "doctor"]}><LabTests /></ProtectedRoute>} />
        <Route path="/lab/Patient" element={<ProtectedRoute role="lab"><Patient /></ProtectedRoute>} />
        <Route path="/lab/create-report" element={<ProtectedRoute allowedRoles={["lab"]}><CreateLabReport /></ProtectedRoute>} />
        <Route path="/lab/report/view/:reportId" element={<ProtectedRoute role="lab"><ViewLabReport /></ProtectedRoute>} />

        {/* Catch All */}

        {/* BILLER PAGES */}
        <Route
          path="/biller"
          element={
            <ProtectedRoute role="biller">
              <BillerLayout>
                <BillerDashboard />
              </BillerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/biller/create"
          element={
            <ProtectedRoute role="biller">
              <BillerLayout>
                <CreateBill />
              </BillerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/biller/history"
          element={
            <ProtectedRoute role="biller">
              <BillerLayout>
                <BillHistory />
              </BillerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/biller/patients"
          element={
            <ProtectedRoute role="biller">
              <BillerLayout>
                <BillerPatients />
              </BillerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/biller/total-collection"
          element={
            <ProtectedRoute role="biller">
              <BillerLayout>
                <TotalCollection />
              </BillerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/biller/todays-collection"
          element={
            <ProtectedRoute role="biller">
              <BillerLayout>
                <TodaysCollection />
              </BillerLayout>
            </ProtectedRoute>
          }
        />

        {/* DOCTOR PAGES */}
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute role="doctor">
              <DoctorLayout>
                <MyPatients />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/patient/:patientId"
          element={
            <ProtectedRoute role={["doctor", "admin"]}>
              <DoctorLayout>
                <PatientDetails />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/report/create/:patientId"
          element={
            <ProtectedRoute role="doctor">
              <DoctorLayout>
                <Report />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/report/view/:reportId"
          element={
            <ProtectedRoute role={["doctor", "admin"]}>
              <DoctorLayout>
                <ViewReport />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/scan-report/view/:reportId"
          element={
            <ProtectedRoute role={["doctor", "admin"]}>
              <DoctorLayout>
                <ViewScanReport />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/lab-report/view/:reportId"
          element={
            <ProtectedRoute role={["doctor", "admin"]}>
              <DoctorLayout>
                <ViewLabReport />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />

        {/* EDIT REPORT */}
        <Route
          path="/doctor/report/edit/:reportId"
          element={
            <ProtectedRoute role="doctor">
              <DoctorLayout>
                <Report />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />

        {/* Generic Create Report (Select Patient) */}
        <Route
          path="/doctor/create-report"
          element={
            <ProtectedRoute role="doctor">
              <DoctorLayout>
                <SelectPatientForReport />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/prescription/create/:patientId"
          element={
            <ProtectedRoute role="doctor">
              <DoctorLayout>
                <Prescriptions />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />

        {/* EDIT PRESCRIPTION */}
        <Route
          path="/doctor/prescription/edit/:prescriptionId"
          element={
            <ProtectedRoute role="doctor">
              <DoctorLayout>
                <Prescriptions />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />

        {/* Generic Prescriptions (Select Patient/List) */}
        <Route
          path="/doctor/prescriptions"
          element={
            <ProtectedRoute role="doctor">
              <DoctorLayout>
                <AllPrescriptions />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/prescription/view/:prescriptionId"
          element={
            <ProtectedRoute role="doctor">
              <DoctorLayout>
                <ViewPrescription />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/profile"
          element={
            <ProtectedRoute role="doctor">
              <DoctorLayout>
                <DoctorProfile />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/availability"
          element={
            <ProtectedRoute role="doctor">
              <DoctorLayout>
                <Availability />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />

        {/* ADMIN SIDEBAR PAGES */}
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute role="admin">
              <DoctorsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/receptionists"
          element={
            <ProtectedRoute role="admin">
              <ReceptionistsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/scanners"
          element={
            <ProtectedRoute role="admin">
              <ScannersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/billers"
          element={
            <ProtectedRoute role="admin">
              <BillersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute role="admin">
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/patient/:patientId"
          element={
            <ProtectedRoute role="admin">
              <PatientDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/report/view/:reportId"
          element={
            <ProtectedRoute role="admin">
              <ViewReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/prescription/view/:prescriptionId"
          element={
            <ProtectedRoute role="admin">
              <ViewPrescription />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/scan-report/view/:reportId"
          element={
            <ProtectedRoute role="admin">
              <ViewScanReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/lab-report/view/:reportId"
          element={
            <ProtectedRoute role="admin">
              <ViewLabReport />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
