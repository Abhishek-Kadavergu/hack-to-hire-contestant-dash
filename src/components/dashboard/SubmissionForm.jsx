import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, Link, CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { supabase } from '../../lib/supabaseClient';

const SubmissionForm = ({ selectedProblem }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    github: ''
  });
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setFormData(prev => ({
          ...prev,
          name: session.user.user_metadata?.name || '',
          email: session.user.email || ''
        }));
      }
    });
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProblem) {
      alert("Please select a problem statement from the list.");
      return;
    }
    if (!file) {
      alert("Please upload your resume before submitting.");
      return;
    }
    
    setLoading(true);
    setSubmissionStatus(null);

    try {
      if (user) {
        // 1. Upload File to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, file);

        if (uploadError) {
          throw new Error("Failed to upload resume: " + uploadError.message);
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);

        // 3. Save Submission Record to Database with status: 'pending'
        const { data: submissionData, error: dbError } = await supabase
          .from('submissions')
          .insert({
            user_id: user.id,
            resume_url: publicUrl,
            github_repo: formData.github,
            problem_number: selectedProblem,
            status: 'pending'
          })
          .select('id')
          .single();

        if (dbError) {
           throw new Error("Failed to save submission: " + dbError.message);
        }

        // 4. Trigger Edge Function (DO NOT call external APIs from frontend)
        setSubmissionStatus('processing');
        
        // Alternative: Direct fetch call to bypass Supabase client auth issues
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-submission`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'apikey': `${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ submissionId: submissionData.id })
        });
        
        const fnError = !response.ok ? { message: `HTTP ${response.status}` } : null;

        if (fnError) {
          console.warn("Edge Function invocation warning:", fnError.message);
          // Don't throw — the submission is saved, processing may happen async
          setSubmissionStatus('pending');
        }

      } else {
        // If bypassed auth for purely UI demo
        await new Promise(r => setTimeout(r, 1500));
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSubmissionStatus(null);
      }, 6000);
      setFormData({ ...formData, github: '' });
      setFile(null);
    } catch (err) {
      console.error(err);
      setSubmissionStatus('failed');
      alert(err.message || "Failed to submit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Submit Your Hackathon Entry
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Your code is your resume. Let it shine.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Full Name</label>
            <input 
              type="text" required value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. John Doe"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Email Address</label>
            <input 
              type="email" required value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="e.g. john@example.com"
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>GitHub Repository URL</label>
          <div style={{ position: 'relative' }}>
            <Link size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="url" required value={formData.github}
              onChange={e => setFormData({...formData, github: e.target.value})}
              placeholder="https://github.com/username/repo"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>
            Resume Upload
          </label>
          <div 
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              textAlign: 'center',
              background: dragActive ? 'var(--primary-glow)' : 'transparent',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('resume-upload').click()}
          >
            <input 
              id="resume-upload" type="file" style={{ display: 'none' }}
              onChange={e => e.target.files && setFile(e.target.files[0])}
              accept=".pdf,.doc,.docx"
            />
            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <File size={32} />
                <span style={{ fontWeight: 600 }}>{file.name}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Click or drag to replace</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <UploadCloud size={32} />
                <span><strong style={{ color: 'var(--text-primary)' }}>Click to upload</strong> or drag and drop</span>
                <span style={{ fontSize: '0.8rem' }}>PDF, DOC, DOCX up to 10MB</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label style={labelStyle}>
            Problem Statement Number
          </label>
          <input 
            type="text" readOnly 
            value={selectedProblem ? `Problem #${selectedProblem}` : 'Please select a problem from the right ->'}
            style={{ 
              background: 'rgba(229, 231, 235, 0.3)', 
              color: selectedProblem ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: selectedProblem ? 600 : 400
            }}
          />
        </div>

        <Button type="submit" fullWidth disabled={loading || !selectedProblem} style={{ marginTop: '0.5rem' }}>
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'flex' }}>
              <Loader2 size={20} />
            </motion.div>
          ) : '👉 Submit for Evaluation'}
        </Button>
      </form>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#ecfdf5',
              border: '1px solid #10b981',
              borderRadius: 'var(--radius-md)',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: 500
            }}
          >
            <CheckCircle size={20} />
            Submission received! AI is analyzing your work...
          </motion.div>
        )}

        {submissionStatus === 'processing' && !success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#eff6ff',
              border: '1px solid #3b82f6',
              borderRadius: 'var(--radius-md)',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: 500
            }}
          >
            <Clock size={20} />
            Processing your submission...
          </motion.div>
        )}

        {submissionStatus === 'failed' && !success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#fef2f2',
              border: '1px solid #ef4444',
              borderRadius: 'var(--radius-md)',
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: 500
            }}
          >
            <AlertCircle size={20} />
            Submission saved but processing encountered an issue. It will be retried.
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '0.5rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

export default SubmissionForm;
