import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Outlet } from 'react-router-dom';
import PoemList from './components/PoemList';
import BrowsePoems from './pages/BrowsePoems';
import AdminAddPoem from './pages/AdminAddPoem';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import About from './pages/About';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Footer from './components/Footer';
import PoemViewer from './pages/PoemViewer';
import PaymentSuccess from './pages/PaymentSuccess';
import AdminDashboard from './pages/AdminDashboard';
import ManagePoems from './pages/ManagePoems';
import AdminSettings from './pages/AdminSettings';
import ManageUsers from './pages/ManageUsers';
import ManageInteractions from './pages/ManageInteractions';
import ManageTransactions from './pages/ManageTransactions';
import ManageMessages from './pages/ManageMessages';
import AdminLayout from './components/AdminLayout';
import UserLibrary from './pages/UserLibrary';
import UserProfile from './pages/UserProfile';
import AdminRegister from './pages/AdminRegister';
import ResetPassword from './pages/ResetPassword';
import ScrollToTop from './components/ScrollToTop';
import StripeDemo from './pages/StripeDemo';
import './App.css';

import { useTheme } from './context/ThemeContext';

function Navbar() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav className="pv-nav">
      <div className="pv-nav-inner">
        {/* Brand */}
        <Link to="/" className="pv-brand">
          <svg className="pv-brand-icon" width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>PoetVerse</span>
        </Link>

        {/* Center Links */}
        <div className="pv-nav-links">
          <NavLink to="/" end className={({ isActive }) => 'pv-link' + (isActive ? ' pv-link--active' : '')}>
            Home
          </NavLink>
          <NavLink to="/browse" end className={({ isActive }) => 'pv-link' + (isActive ? ' pv-link--active' : '')}>Browse Poems</NavLink>
          <NavLink to="/browse?category=Books" className={({ isActive, location }) => 'pv-link' + (isActive || (location && location.search.includes('Books')) ? ' pv-link--active' : '')}>Bookshelf</NavLink>
          <NavLink to="/about" className={({ isActive }) => 'pv-link' + (isActive ? ' pv-link--active' : '')}>
            About
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => 'pv-link' + (isActive ? ' pv-link--active' : '')}>
            Contact
          </NavLink>
        </div>

        {/* Right side */}
        <div className="pv-nav-right">
          <button
            onClick={toggleTheme}
            className="pv-link"
            style={{ marginRight: '1.5rem', display: 'flex', alignItems: 'center' }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="md:hidden text-ink p-2 -mr-2 flex items-center justify-center focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-cream dark:bg-slate-900 border-t border-border absolute top-full left-0 w-full shadow-lg flex flex-col items-center py-4 space-y-4 font-sans animate-fade-in z-50">
          <NavLink to="/" onClick={closeMobileMenu} className={({ isActive }) => 'font-bold text-lg text-ink hover:text-accent' + (isActive ? ' text-accent' : '')}>Home</NavLink>
          <NavLink to="/browse" onClick={closeMobileMenu} className={({ isActive }) => 'font-bold text-lg text-ink hover:text-accent' + (isActive ? ' text-accent' : '')}>Browse Poems</NavLink>
          <NavLink to="/browse?category=Books" onClick={closeMobileMenu} className="font-bold text-lg text-ink hover:text-accent">Bookshelf</NavLink>
          <NavLink to="/about" onClick={closeMobileMenu} className={({ isActive }) => 'font-bold text-lg text-ink hover:text-accent' + (isActive ? ' text-accent' : '')}>About</NavLink>
          <NavLink to="/contact" onClick={closeMobileMenu} className={({ isActive }) => 'font-bold text-lg text-ink hover:text-accent' + (isActive ? ' text-accent' : '')}>Contact</NavLink>
        </div>
      )}
    </nav>
  );
}

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="pv-main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="pv-app">
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PoemList />} />
            <Route path="/browse" element={<BrowsePoems />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/poems/:id" element={<PoemViewer />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/library" element={<UserLibrary />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/stripe-demo" element={<StripeDemo />} />
          </Route>

          {/* Standalone Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="add-poem" element={<AdminAddPoem />} />
            <Route path="edit-poem/:id" element={<AdminAddPoem />} />
            <Route path="manage" element={<ManagePoems />} />
            <Route path="interactions" element={<ManageInteractions />} />
            <Route path="transactions" element={<ManageTransactions />} />
            <Route path="messages" element={<ManageMessages />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="register-admin" element={<AdminRegister />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
