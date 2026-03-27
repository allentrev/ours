import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SEO } from 'components';
import { useAuth } from '../auth/AuthContext';
import { getRefDataValuesByPage } from '../utilities';

interface LocationState {
  error?: string;
  skipAuth?: boolean;
  adminName?: string;
}

const AdminPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  const { isAuthenticated, adminName, login, logout, skipAuth } = useAuth();

  const [name, setName] = useState<string>(state?.adminName || '');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [strings, setStrings] = useState<string[]>([]);

  // Load strings for admin page
  useEffect(() => {
    const getData = async () => {
      const data = await getRefDataValuesByPage("Admin");
      setStrings(data);
    };
    getData();
  }, []);

  // Show error from navigation state, if any
  useEffect(() => {
    if (state?.error) {
      setError(state.error);
    }
  }, [state]);

  // Handle skipAuth ONLY on internal navigation (NOT on refresh)
  useEffect(() => {
    if (state?.skipAuth) {
      skipAuth(state.adminName || 'Admin');
      setError('');
    }
  }, [state, skipAuth]);

  // Clear error on successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      setError('');
    }
  }, [isAuthenticated]);

    const wToken = strings[0] || "MISSING"; 

    // Check password against the refData value
    const checkPassword = () => {
      if (!wToken) {
        setError('System not ready. Try again shortly.');
        return;
      }

      if (password === wToken) {
        const success = login(name || 'Admin', password);
        if (success) {
          setError('');
        } else {
          setError('Login failed');
        }
      } else {
        setError('Incorrect password');
      }
    };
  return (
    <div className="flex items-center justify-center p-4">
      <SEO
        title="AdminPage – Maidenhead Town Bowls Club"
        description="Provides access to the Administration features"
      />

      {!isAuthenticated ? (
        <div className="bg-gray-200 p-6 rounded-xl shadow-md w-full max-w-md">
          <div className="mb-4 text-left">
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Home
            </Link>
          </div>
          <h2 className="text-xl font-semibold mb-4">Admin Login</h2>

          {error && <p className="text-red-500 mb-3">{error}</p>}

          <div className="mb-4">
            <label className="block mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {password.length > 0 && (
            <button
              onClick={checkPassword}
              className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
            >
              Login
            </button>
          )}
        </div>
      ) : (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Welcome, {adminName || 'Admin'}!</h2>

          <Link
            to="/maintainRefData"
            state={{ skipAuth: true, adminName }}
            className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Maintain Data
          </Link>

          <Link
            to="/maintainEvent"
            state={{ skipAuth: true, adminName }}
            className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Maintain Event
          </Link>

          <Link
            to="/maintainMember"
            state={{ skipAuth: true, adminName }}
            className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Maintain Member
          </Link>

          <Link
            to="/maintainGallery"
            state={{ skipAuth: true, adminName }}
            className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Maintain Gallery Images
          </Link>
          
          {/* change 6 on ChangeControl List 22/8/25
          <Link
            to="/maintainCommittee"
            state={{ skipAuth: true, adminName }}
            className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Maintain Committee
          </Link>

          <Link
            to="/maintainOfficer"
            state={{ skipAuth: true, adminName }}
            className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Maintain Officer
          </Link>
          */}
          
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={logout}
              className="block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Logout
            </button>
            <Link
              to="/"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;