import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { CheckCircle2 } from 'lucide-react';

const dummyProblems = [
  "Build a scalable e-commerce platform with real-time inventory",
  "Design a collaborative code editor (like Google Docs for devs)",
  "Create an AI-based resume screening system",
  "Develop a real-time chat app with video support",
  "Build a personal finance tracker with analytics",
  "Design a microservices-based blogging platform",
  "Create a GitHub repo analyzer with scoring (meta 😄)"
];

const ProblemList = ({ selectedProblem, onSelect }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Problem Statements
      </h3>
      
      {dummyProblems.map((prob, index) => {
        const pNum = index + 1;
        const isSelected = selectedProblem === pNum;

        return (
          <motion.div 
            key={pNum}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              hoverable
              onClick={() => onSelect(pNum)}
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                boxShadow: isSelected ? '0 4px 14px 0 rgba(79, 70, 229, 0.2)' : undefined,
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ 
                  background: isSelected ? 'var(--primary)' : 'var(--bg-color)', 
                  color: isSelected ? 'white' : 'var(--text-secondary)',
                  width: '2rem', height: '2rem', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, flexShrink: 0
                }}>
                  {pNum}
                </div>
                <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {prob}
                </div>
                {isSelected && (
                  <CheckCircle2 size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProblemList;
