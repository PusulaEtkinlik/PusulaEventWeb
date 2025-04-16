import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import AdminRegisterWithSmsTo from './components/AdminRegisterWithSmsTo';
import Dashboard from './components/Dashboard';
import CreateEvent from './components/CreateEvent';
import "react-datepicker/dist/react-datepicker.css";
import InviteGuest from "./components/InviteGuest";
import CheckIn from "./components/CheckIn";
import ImportPage from "./components/ImportPage";
import EventsPage from "./components/EventsPage";
import GuestListPage from "./components/GuestListPage";
import ResetPasswordWithApproval from "./components/ResetPasswordWithApproval";
import PhoneAuth from "./components/PhoneAuth";
import EditEvent from "./components/EditEvent";
import AnalyticsPage from "./components/AnalyticsPage";
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">

        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register-sms" element={<AdminRegisterWithSmsTo />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/invite" element={<InviteGuest />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id/guests" element={<GuestListPage />} />
          <Route path="/reset-password" element={<ResetPasswordWithApproval />} />
          <Route path="/reset-password-auth" element={<PhoneAuth />} />
          <Route path="/edit-event/:id" element={<EditEvent />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;