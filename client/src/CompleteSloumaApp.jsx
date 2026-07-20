import React, { useState, useEffect } from 'react';
import LoginScreen from './pages/LoginScreen';
import SignupScreen from './pages/SignupScreen';
import LandingPage from './pages/LandingPage';
import PatientInterface from './pages/patient/PatientInterface';
import CaregiverInterface from './pages/caregiver/CaregiverInterface';
import DoctorInterface from './pages/doctor/DoctorInterface';
import AdminInterface from './pages/admin/AdminInterface';
import VerifyEmailPage from './pages/VerifyEmailPage';
import SetPasswordPage from './pages/SetPasswordPage';

export default function SloumaHealthApp() {
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [language, setLanguage] = useState(localStorage.getItem('google_lang') || 'fr');
  const [showVerify, setShowVerify] = useState(window.location.pathname === '/verify-email');
  const [showSetPassword, setShowSetPassword] = useState(window.location.pathname === '/set-password');


  useEffect(() => {
    localStorage.setItem('google_lang', language);
  }, [language]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  const fetchUserData = async (role, _id) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const token = localStorage.getItem('token');

      let endpoint = '';
      if (role === 'patient') endpoint = `/patients/${_id}`;
      else if (role === 'doctor') endpoint = `/doctors/${_id}`;
      else if (role === 'caregiver') endpoint = `/caregivers/${_id}`;
      else if (role === 'admin') endpoint = `/admins/${_id}`;
      else return;

      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const enrichedData = {
          ...data,
          role,
          id: data.id || data._id,
          name: data.name || 'User',
          avatar: data.name?.substring(0, 2) || 'US',
        };

        if (role === 'admin') {
          setUserData(enrichedData);
        } else {
          setCurrentPatient({
            ...enrichedData,
            conditions: data.currentConditions || []
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.role) {
          setShowLanding(false);
          setUserRole(parsedUser.role);
          setUserData(parsedUser);
          fetchUserData(parsedUser.role, parsedUser._id || parsedUser.id);
        }
      } catch (_) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserRole(null);
    setUserData(null);
    setCurrentPatient(null);
    setShowLanding(false);
    setShowSignup(false);
  };


  const handleLoginSuccess = (role, userObject) => {
    setUserRole(role);
    setUserData(userObject);
    fetchUserData(role, userObject._id || userObject.id);
  };

  return (
    <>
      {showVerify ? (
        <VerifyEmailPage onGoToLogin={() => { setShowVerify(false); setShowLanding(false); setShowSignup(false); window.history.pushState({}, '', '/'); }} />
      ) : showSetPassword ? (
        <SetPasswordPage onGoToLogin={() => { setShowSetPassword(false); setShowLanding(false); setShowSignup(false); window.history.pushState({}, '', '/'); }} />
      ) : showLanding ? (
        <LandingPage

          onNavigateToLogin={() => { setShowLanding(false); setShowSignup(false); }}
          onNavigateToSignup={() => { setShowLanding(false); setShowSignup(true); }}
          language={language}
          setLanguage={setLanguage}
        />
      ) : !userRole ? (
        showSignup ? (
          <SignupScreen
            onSignupSuccess={handleLoginSuccess}
            language={language}
            setLanguage={setLanguage}
            onGoToLogin={() => setShowSignup(false)}
            onGoToLanding={() => setShowLanding(true)}
          />
        ) : (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            language={language}
            setLanguage={setLanguage}
            onGoToSignup={() => setShowSignup(true)}
            onGoToLanding={() => setShowLanding(true)}
          />
        )
      ) : (
        <>
          {userRole === 'patient' && (currentPatient || userData) && (
            <PatientInterface
              patient={currentPatient || userData}
              onLogout={handleLogout}
              language={language}
              setLanguage={setLanguage}
              onUpdateUser={(updated) => {
                setCurrentPatient(prev => ({ ...prev, ...updated }));
                setUserData(prev => ({ ...prev, ...updated }));
                localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...updated }));
              }}
            />
          )}
          {userRole === 'caregiver' && (currentPatient || userData) && (
            <CaregiverInterface
              patient={currentPatient || userData}
              onLogout={handleLogout}
              language={language}
              setLanguage={setLanguage}
              onUpdateUser={(updated) => {
                setCurrentPatient(prev => ({ ...prev, ...updated }));
                setUserData(prev => ({ ...prev, ...updated }));
                localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...updated }));
              }}
            />
          )}
          {userRole === 'doctor' && (
            <DoctorInterface
              patient={currentPatient}
              onLogout={handleLogout}
              language={language}
              setLanguage={setLanguage}
              onUpdateUser={(updated) => {
                setUserData(prev => ({ ...prev, ...updated }));
                localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...updated }));
              }}
            />
          )}
          {userRole === 'admin' && (
            <AdminInterface
              admin={userData}
              onLogout={handleLogout}
              language={language}
              setLanguage={setLanguage}
              onUpdateUser={(updated) => {
                setUserData(prev => ({ ...prev, ...updated }));
                localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...updated }));
              }}
            />
          )}
        </>
      )}
    </>
  );
}
