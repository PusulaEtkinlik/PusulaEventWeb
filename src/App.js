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
import PrivateRoute from "./components/PrivateRoute";
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">

        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register-sms" element={<AdminRegisterWithSmsTo />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/create-event"
            element={
              <PrivateRoute>
                <CreateEvent />
              </PrivateRoute>
            }
          />

          <Route
            path="/invite"
            element={
              <PrivateRoute>
                <InviteGuest />
              </PrivateRoute>
            }
          />

          <Route
            path="/check-in"
            element={
              <PrivateRoute>
                <CheckIn />
              </PrivateRoute>
            }
          />

          <Route
            path="/import"
            element={
              <PrivateRoute>
                <ImportPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/events"
            element={
              <PrivateRoute>
                <EventsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/events/:id/guests"
            element={
              <PrivateRoute>
                <GuestListPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/reset-password"
            element={
              <PrivateRoute>
                <ResetPasswordWithApproval />
              </PrivateRoute>
            }
          />

          <Route
            path="/reset-password-auth"
            element={
              <PrivateRoute>
                <PhoneAuth />
              </PrivateRoute>
            }
          />

          <Route
            path="/edit-event/:id"
            element={
              <PrivateRoute>
                <EditEvent />
              </PrivateRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <AnalyticsPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;