'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Cpu, CheckCircle } from 'lucide-react';

/**
 * A premium glassmorphic overlay indicating active Agent Rediscovery.
 * Features a glowing neon radar, vertical laser scanner sweeps, and a live log ticker.
 */
export default function AgentRediscoveryOverlay({ isVisible, statusMessage, steps = [] }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '32px',
            background: 'rgba(8, 11, 17, 0.72)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(0, 242, 254, 0.15)',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(99, 102, 241, 0.05)',
            overflow: 'hidden',
            padding: '24px'
          }}
        >
          {/* Laser Scanner Sweep Line */}
          <motion.div
            animate={{
              y: ['0%', '400%', '0%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: '4px',
              background: 'linear-gradient(to right, transparent, var(--color-accent, #00F2FE), var(--color-primary, #6366F1), var(--color-accent, #00F2FE), transparent)',
              boxShadow: '0 0 15px var(--color-accent, #00F2FE), 0 0 30px var(--color-primary, #6366F1)',
              opacity: 0.75,
              pointerEvents: 'none'
            }}
          />

          {/* Central Rotating Neon Radar */}
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                border: '2px dashed rgba(0, 242, 254, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />

            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                border: '2px solid transparent',
                borderTopColor: 'var(--color-accent, #00F2FE)',
                borderBottomColor: 'var(--color-primary, #6366F1)',
                boxShadow: '0 0 20px rgba(0, 242, 254, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />

            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'var(--color-accent, #00F2FE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <RefreshCw size={28} className="animate-spin text-cyan-400" />
            </div>
          </div>

          {/* Action Status Title */}
          <motion.h4
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: '20px',
              fontWeight: 900,
              fontFamily: 'var(--font-jakarta)',
              margin: '0 0 8px 0',
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Cpu size={20} className="text-indigo-400 animate-pulse" />
            <span>Agentic Rediscovery Active</span>
          </motion.h4>

          {/* Ticker Log Message */}
          <motion.p
            key={statusMessage}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary, #94A3B8)',
              margin: '0 0 24px 0',
              fontFamily: 'var(--font-inter)',
              textAlign: 'center',
              fontWeight: 500
            }}
          >
            {statusMessage}
          </motion.p>

          {/* Micro Checklist of Running Steps */}
          {steps && steps.length > 0 && (
            <div style={{
              width: '100%',
              maxWidth: '320px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {steps.map((step, index) => {
                const isActive = step.status === 'running';
                const isCompleted = step.status === 'completed';
                
                return (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: isCompleted ? 'var(--color-text-secondary, #94A3B8)' : isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isCompleted ? (
                        <CheckCircle size={14} className="text-green-400" />
                      ) : isActive ? (
                        <RefreshCw size={14} className="animate-spin text-cyan-400" />
                      ) : (
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.2)' }} />
                      )}
                      <span>{step.label}</span>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: isCompleted ? '#aeec1d' : isActive ? '#00f2fe' : 'rgba(255,255,255,0.2)'
                    }}>
                      {isCompleted ? 'SYNCED' : isActive ? 'COMPILING' : 'WAITING'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
