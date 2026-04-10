import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import ProblemList from '../components/dashboard/ProblemList';
import SubmissionForm from '../components/dashboard/SubmissionForm';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedProblem, setSelectedProblem] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="container" style={{ padding: '2rem 2rem 5rem', flex: 1 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
          gap: '3rem',
          alignItems: 'start'
        }}
      >
        {/* LEFT SECTION (60%) */}
        <div>
          <SubmissionForm selectedProblem={selectedProblem} />
        </div>

        {/* RIGHT SECTION (40%) */}
        <div style={{ position: 'sticky', top: '6rem' }}>
          <ProblemList 
            selectedProblem={selectedProblem} 
            onSelect={setSelectedProblem} 
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
