import React, { useState, useEffect } from 'react';
import Welcome from './components/Welcome';
import StudentNameEntry from './components/StudentNameEntry';
import StudentPolling from './components/StudentPolling';
import TeacherDashboard from './components/TeacherDashboard';
import KickedOut from './components/KickedoOut';

const App = () => {
  const [currentView, setCurrentView] = useState('welcome');
  const [studentName, setStudentName] = useState('');
  const [isKickedOut, setIsKickedOut] = useState(false);

  // Check if student name exists in sessionStorage on component mount
  useEffect(() => {
    const savedName = sessionStorage.getItem('studentName');
    if (savedName) {
      setStudentName(savedName);
    }
  }, []);

  const handleRoleSelect = (role) => {
    if (role === 'student') {
      // Check if student name is already stored for this tab
      setIsKickedOut(false);
      const savedName = sessionStorage.getItem('studentName');
      if (savedName) {
        setStudentName(savedName);
        setCurrentView('student-polling');
      } else {
        setCurrentView('student-name');
      }
    } else {
      setCurrentView('teacher');
    }
  };

  const handleNameSubmit = (name) => {
    // Store student name in sessionStorage (unique to each tab)
    sessionStorage.setItem('studentName', name);
    setStudentName(name);
    setCurrentView('student-polling');
  };

  const handleKickedOut = () => {
    setIsKickedOut(true);
    setCurrentView('kicked-out');
  };

  const handleRetryAfterKick = () => {
    setIsKickedOut(false);
    setStudentName('');
    sessionStorage.removeItem('studentName');
    setCurrentView('welcome');
  };

  const handleBack = () => {
    setCurrentView('welcome');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'welcome':
        return <Welcome onRoleSelect={handleRoleSelect} />;
      case 'student-name':
        return <StudentNameEntry onNameSubmit={handleNameSubmit} onBack={handleBack} />;
      case 'student-polling':
        return (
          <StudentPolling 
            studentName={studentName} 
            onBack={handleBack} 
            onKickedOut={handleKickedOut}
          />
        );
      case 'teacher':
        return <TeacherDashboard onBack={handleBack} />;
      case 'kicked-out':
        return <KickedOut onRetry={handleRetryAfterKick} />;
      default:
        return <Welcome onRoleSelect={handleRoleSelect} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
};

export default App;