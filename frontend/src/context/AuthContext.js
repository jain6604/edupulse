import { createContext, useContext, useState, useEffect } from 'react';
import { loginStudent, registerStudent } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(() => {
    const storedStudent = localStorage.getItem('student');
    return storedStudent ? JSON.parse(storedStudent) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginStudent({ email, password });
      const { access_token } = res.data;

      // Decode student_id from token
      const payload = JSON.parse(atob(access_token.split('.')[1]));
      const studentData = { student_id: payload.sub, email };

      localStorage.setItem('token', access_token);
      localStorage.setItem('student', JSON.stringify(studentData));
      setToken(access_token);
      setStudent(studentData);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerStudent(formData);
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    setToken(null);
    setStudent(null);
  };

  return (
    <AuthContext.Provider value={{ student, token, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}