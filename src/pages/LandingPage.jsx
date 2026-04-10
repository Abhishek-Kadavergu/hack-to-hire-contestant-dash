import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Code, Bot, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LandingPage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300 } }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      
      {/* Background Animated Blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1], 
          x: [0, 50, 0], 
          y: [0, -30, 0] 
        }} 
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%', zIndex: -1, pointerEvents: 'none'
        }}
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1], 
          x: [0, -60, 0], 
          y: [0, 40, 0] 
        }} 
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', bottom: '20%', right: '5%', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%', zIndex: -1, pointerEvents: 'none'
        }}
      />

      {/* Hero Section */}
      <motion.section 
        className="container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ 
          minHeight: '80vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          textAlign: 'center',
          paddingTop: '4rem'
        }}
      >
        <motion.div variants={itemVariants} style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
          padding: '0.5rem 1rem', background: 'var(--glass-bg)', 
          border: '1px solid var(--border-color)', borderRadius: '2rem',
          fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)',
          boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.1)',
          marginBottom: '2rem'
        }}>
          ✨ Built for ambitious developers like Abhi 🚀
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="heading-hero">
          From Hackathon to Hire <br />
          <span style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)', 
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' 
          }}>
            Automatically.
          </span>
        </motion.h1>

        <motion.p variants={itemVariants} className="subheading" style={{ marginBottom: '3rem' }}>
          Let your code speak. TalentFlow analyzes, scores, and shortlists top developers instantly. Focus on building, we handle the matching.
        </motion.p>

        <motion.div variants={itemVariants}>
          <Button 
            onClick={() => navigate('/login')} 
            icon={<ArrowRight size={20} />} 
            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
          >
            👉 Get Started
          </Button>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="container" style={{ padding: '5rem 0' }}>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem'
          }}
        >
          {features.map((feature, i) => (
            <Card key={i} hoverable>
              <div style={{ 
                width: '3rem', height: '3rem', borderRadius: 'var(--radius-lg)', 
                background: 'var(--primary-glow)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
                marginBottom: '1.5rem'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
            </Card>
          ))}
        </motion.div>
      </section>

      {/* Footer CTA Section */}
      <section style={{ 
        marginTop: 'auto', padding: '6rem 2rem', 
        background: 'linear-gradient(180deg, transparent 0%, rgba(243, 244, 246, 0.7) 100%)',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>
            Ready to get discovered?
          </h2>
          <Button onClick={() => navigate('/dashboard')} variant="secondary" icon={<CheckCircle size={20} className="text-green-500" />}>
            Start Your Submission
          </Button>
        </div>
      </section>

    </div>
  );
};

const features = [
  {
    icon: <Bot size={24} />,
    title: "🧠 AI Repo Analysis",
    desc: "Understand code quality beyond commits. Our intelligence scores architecture, standard practices, and logic complexity.",
  },
  {
    icon: <Code size={24} />,
    title: "📊 Smart Scoring",
    desc: "Objective evaluation powered by AI. No bias, just a pure technical breakdown of your submitted hackathon solution.",
  },
  {
    icon: <Zap size={24} />,
    title: "⚡ Instant Shortlisting",
    desc: "Top candidates, zero manual effort. We instantly map your skills to open hiring needs precisely when you finish.",
  }
];

export default LandingPage;
