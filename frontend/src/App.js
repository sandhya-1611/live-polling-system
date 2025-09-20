import React, { useState } from 'react';
import Welcome from './components/Welcome';
import TeacherDashboard from './components/TeacherDashboard';
import StudentNameEntry from './components/StudentNameEntry';
import StudentDashboard from './components/StudentDashboard';
import StudentPolling from './components/StudentPolling';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('welcome'); // 'welcome', 'teacher', 'student-name', 'student-dashboard', 'student-polling'
  const [studentName, setStudentName] = useState('');
  const [hasActiveQuestion, setHasActiveQuestion] = useState(false);

  const handleRoleSelection = (role) => {
    if (role === 'teacher') {
      setCurrentView('teacher');
    } else if (role === 'student') {
      setCurrentView('student-name');
    }
  };

  const handleStudentNameSubmit = (name) => {
    setStudentName(name);
    // Always start with dashboard (waiting state)
    // The StudentPolling component will handle the transition based on socket events
    setCurrentView('student-dashboard');
  };

  const handleBackToWelcome = () => {
    setCurrentView('welcome');
    setStudentName('');
    setHasActiveQuestion(false);
  };

  const handleQuestionReceived = () => {
    setHasActiveQuestion(true);
    setCurrentView('student-polling');
  };

  const handleQuestionEnded = () => {
    setHasActiveQuestion(false);
    setCurrentView('student-dashboard');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'welcome':
        return <Welcome onRoleSelect={handleRoleSelection} />;
      
      case 'teacher':
        return <TeacherDashboard onBack={handleBackToWelcome} />;
      
      case 'student-name':
        return (
          <StudentNameEntry 
            onNameSubmit={handleStudentNameSubmit}
            onBack={handleBackToWelcome}
          />
        );
      
      case 'student-dashboard':
        return (
          <StudentDashboard 
            studentName={studentName}
            onQuestionReceived={handleQuestionReceived}
            onBack={handleBackToWelcome}
          />
        );
      
      case 'student-polling':
        return (
          <StudentPolling 
            studentName={studentName}
            onQuestionEnded={handleQuestionEnded}
            onBack={handleBackToWelcome}
          />
        );
      
      default:
        return <Welcome onRoleSelect={handleRoleSelection} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
}

export default App;