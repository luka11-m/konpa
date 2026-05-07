import React, { useState, useEffect } from 'react';
import { auth } from './services/auth';
import { onAuthStateChanged } from 'firebase/auth';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import HomePage from './components/HomePage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('login');

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return page === 'login' ? (
      <LoginPage onSwitchPage={() => setPage('register')} />
    ) : (
      <RegisterPage onSwitchPage={() => setPage('login')} />
    );
  }

  return <HomePage user={user} />;
}

export default App;
