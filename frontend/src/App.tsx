import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Slots from './pages/Slots';
import Dice from './pages/Dice';
import Coinflip from './pages/Coinflip';
import Mines from './pages/Mines';
import DailyRewards from './pages/DailyRewards';
import Trading from './pages/Trading';
import Crash from './pages/Crash';
import Profile from './pages/Profile';
import CardPacks from './pages/CardPacks';
import CardCollection from './pages/CardCollection';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/slots"
              element={
                <ProtectedRoute>
                  <Slots />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dice"
              element={
                <ProtectedRoute>
                  <Dice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coinflip"
              element={
                <ProtectedRoute>
                  <Coinflip />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mines"
              element={
                <ProtectedRoute>
                  <Mines />
                </ProtectedRoute>
              }
            />
            <Route
              path="/daily-rewards"
              element={
                <ProtectedRoute>
                  <DailyRewards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trading"
              element={
                <ProtectedRoute>
                  <Trading />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trading/:assetId"
              element={
                <ProtectedRoute>
                  <Trading />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crash"
              element={
                <ProtectedRoute>
                  <Crash />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cards"
              element={
                <ProtectedRoute>
                  <CardPacks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cards/collection"
              element={
                <ProtectedRoute>
                  <CardCollection />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#e2e8f0',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#e2e8f0',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
