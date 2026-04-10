import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hexagon, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Navigation = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-panel"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        margin: '1rem',
        position: 'sticky',
        top: '1rem',
        zIndex: 50,
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>
        <Hexagon size={24} strokeWidth={2.5} />
        TalentFlow
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              👋 Welcome, {user.user_metadata?.name || 'Abhi'}
            </span>
            {location.pathname !== '/dashboard' && (
              <Link to="/dashboard" style={navLinkStyle}>
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            )}
            <button 
              onClick={async () => await supabase.auth.signOut()}
              style={{ ...navLinkStyle, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </>
        ) : (
          location.pathname !== '/login' && (
            <Link to="/login" style={{ ...navLinkStyle, background: 'var(--primary)', color: 'white' }}>
              <LogIn size={18} />
              Sign In
            </Link>
          )
        )}
      </div>
    </motion.nav>
  );
};

const navLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.5rem 1rem',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.9rem',
  fontWeight: 500,
  transition: 'all var(--transition)',
  border: '1px solid transparent',
};

export default Navigation;
