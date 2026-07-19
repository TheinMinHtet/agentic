'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Cpu, Sparkles, BarChart3, Rocket, Layers, CheckCircle2, Activity } from 'lucide-react';

export default function WarRoomNodeGraph({ isSimulating, onNodeClick }) {
    const [hoveredNodeId, setHoveredNodeId] = useState(null);

    // Center Core Node (AI WarRoom Orchestrator)
    const centerNode = {
        id: 'core',
        title: 'WarRoom Core Engine',
        subtitle: 'Real-time Consensus Protocol',
        x: 400,
        y: 288,
        color: '#00F2FE',
        icon: <Layers size={30} className="text-cyan-400" />
    };

    // 5 Circular Specialized Agent Nodes with exact SVG center points
    const outerNodes = [
        {
            id: 'market',
            title: 'Market Intelligence',
            role: 'Agent 01',
            status: 'Synthesizing TAM, market velocity, and competitor weaknesses.',
            liveMetric: 'TAM: $4.2B · 12 Competitors Analyzed · Opportunity Score: 94/100',
            x: 95,
            y: 178,
            color: '#00F2FE',
            icon: <Globe size={24} style={{ color: '#00F2FE' }} />,
            labelPosition: 'below',
            delay: 0
        },
        {
            id: 'tech',
            title: 'Technical Architect',
            role: 'Agent 02',
            status: 'Designing fault-tolerant micro-agent stack and schema specifications.',
            liveMetric: 'Stack: Next.js 15 + LangGraph · Latency: <180ms · Uptime: 99.99%',
            x: 400,
            y: 100,
            color: '#818CF8',
            icon: <Cpu size={24} style={{ color: '#818CF8' }} />,
            labelPosition: 'right',
            delay: 0.4
        },
        {
            id: 'brand',
            title: 'Brand Identity',
            role: 'Agent 03',
            status: 'Crafting premium positioning, typography tokens, and voice hierarchy.',
            liveMetric: 'Voice: Authority + Modern Sleekness · Archetype: The Innovator',
            x: 705,
            y: 178,
            color: '#A78BFA',
            icon: <Sparkles size={24} style={{ color: '#A78BFA' }} />,
            labelPosition: 'below',
            delay: 0.8
        },
        {
            id: 'finance',
            title: 'Financial Modeling',
            role: 'Agent 04',
            status: 'Validating unit economics, burn multiple, and 24-month runway projections.',
            liveMetric: 'Target CAC: $12 · Projected LTV: $149 · Gross Margin: 82%',
            x: 655,
            y: 438,
            color: '#38BDF8',
            icon: <BarChart3 size={24} style={{ color: '#38BDF8' }} />,
            labelPosition: 'below',
            delay: 1.2
        },
        {
            id: 'growth',
            title: 'Growth Strategy',
            role: 'Agent 05',
            status: 'Mapping automated B2B acquisition funnels and viral referral loops.',
            liveMetric: 'Growth Velocity: +28% MoM · Primary Loop: Viral Team Invite Engine',
            x: 145,
            y: 438,
            color: '#34D399',
            icon: <Rocket size={24} style={{ color: '#34D399' }} />,
            labelPosition: 'below',
            delay: 1.6
        }
    ];

    const activeTelemetryNode = hoveredNodeId 
        ? outerNodes.find(n => n.id === hoveredNodeId)
        : null;

    return (
        <div className="warroom-canvas-container">
            {/* 1. Single SVG Canvas handling Circles, Paths, AND ForeignObject Icons/Titles in identical coordinate space */}
            <svg
                viewBox="0 0 800 610"
                className="warroom-svg"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <filter id="packet-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="node-ring-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Connecting Lines from Outer Nodes to Core */}
                {outerNodes.map((node) => {
                    const isHighlighted = hoveredNodeId === node.id || isSimulating;
                    return (
                        <g key={`lines-${node.id}`}>
                            <line
                                x1={node.x}
                                y1={node.y}
                                x2={centerNode.x}
                                y2={centerNode.y}
                                stroke={isHighlighted ? node.color : 'rgba(255, 255, 255, 0.12)'}
                                strokeWidth={isHighlighted ? '2' : '1.2'}
                                strokeDasharray={isHighlighted ? 'none' : '4 4'}
                                className="transition-all duration-300"
                            />

                            {/* Inbound Data Dot */}
                            <motion.circle
                                r={isHighlighted ? '4.5' : '3'}
                                fill={node.color}
                                filter="url(#packet-glow)"
                                initial={{ cx: node.x, cy: node.y, opacity: 0 }}
                                animate={{
                                    cx: [node.x, centerNode.x, node.x],
                                    cy: [node.y, centerNode.y, node.y],
                                    opacity: [0, 1, 1, 0]
                                }}
                                transition={{
                                    duration: isSimulating ? 1.5 : 3.2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: node.delay
                                }}
                            />

                            {/* Outbound Synthesized Dot */}
                            <motion.circle
                                r="2.5"
                                fill="#FFFFFF"
                                filter="url(#packet-glow)"
                                initial={{ cx: centerNode.x, cy: centerNode.y, opacity: 0 }}
                                animate={{
                                    cx: [centerNode.x, node.x, centerNode.x],
                                    cy: [centerNode.y, node.y, centerNode.y],
                                    opacity: [0, 0.85, 0.85, 0]
                                }}
                                transition={{
                                    duration: isSimulating ? 1.5 : 3.2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: node.delay + 1.2
                                }}
                            />
                        </g>
                    );
                })}

                {/* Neural Mesh Ring */}
                {outerNodes.map((node, i) => {
                    const nextNode = outerNodes[(i + 1) % outerNodes.length];
                    return (
                        <line
                            key={`ring-${i}`}
                            x1={node.x}
                            y1={node.y}
                            x2={nextNode.x}
                            y2={nextNode.y}
                            stroke="rgba(255, 255, 255, 0.04)"
                            strokeWidth="1"
                            strokeDasharray="2 6"
                        />
                    );
                })}

                {/* Outer Nodes - Circle Base, Pulsing Ring, AND Centered ForeignObject Icon */}
                {outerNodes.map((node, i) => {
                    const isHovered = hoveredNodeId === node.id;
                    const circleRadius = 32;
                    return (
                        <g
                            key={`node-circle-${node.id}`}
                            tabIndex={0}
                            role="button"
                            aria-label={`${node.role}: ${node.title}`}
                            onMouseEnter={() => setHoveredNodeId(node.id)}
                            onMouseLeave={() => setHoveredNodeId(null)}
                            onFocus={() => setHoveredNodeId(node.id)}
                            onBlur={() => setHoveredNodeId(null)}
                            onClick={() => onNodeClick && onNodeClick(node)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onNodeClick && onNodeClick(node);
                                }
                            }}
                            style={{
                                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                transformOrigin: `${node.x}px ${node.y}px`,
                                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                outline: 'none'
                            }}
                            className="cursor-pointer group focus:outline-none"
                        >
                            {/* Gentle Active Pulsing Ripple */}
                            <motion.circle
                                cx={node.x}
                                cy={node.y}
                                r="42"
                                fill="none"
                                stroke={node.color}
                                strokeWidth="1.5"
                                animate={{
                                    r: isHovered || isSimulating ? [42, 58, 42] : [40, 50, 40],
                                    opacity: isHovered || isSimulating ? [0.8, 0.1, 0.8] : [0.45, 0, 0.45],
                                    strokeWidth: [1.5, 0.5, 1.5]
                                }}
                                transition={{
                                    duration: isSimulating ? 1.6 : 3 + i * 0.4,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: i * 0.3
                                }}
                            />

                            {/* Node Glass Background Circle */}
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={circleRadius}
                                fill={isHovered ? 'rgba(30, 41, 59, 0.98)' : 'rgba(15, 23, 42, 0.92)'}
                                stroke={isHovered || isSimulating ? node.color : 'rgba(255, 255, 255, 0.18)'}
                                strokeWidth={isHovered || isSimulating ? '2.5' : '1.5'}
                                filter={isHovered ? 'url(#node-ring-glow)' : 'none'}
                                className="transition-all duration-300"
                            />

                            {/* 100% Dead-Center Icon inside circle via exact ForeignObject box */}
                            <foreignObject
                                x={node.x - circleRadius}
                                y={node.y - circleRadius}
                                width={circleRadius * 2}
                                height={circleRadius * 2}
                                className="pointer-events-none overflow-visible"
                            >
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none'
                                }}>
                                    {node.icon}
                                </div>
                            </foreignObject>

                            {/* Clean Title Badge exactly aligned to node */}
                            {node.labelPosition === 'right' ? (
                                <foreignObject
                                    x={node.x + circleRadius + 12}
                                    y={node.y - 24}
                                    width={180}
                                    height={48}
                                    className="pointer-events-none overflow-visible"
                                >
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        textAlign: 'left',
                                        pointerEvents: 'none'
                                    }}>
                                        <span className="node-role" style={{ fontSize: '11px', fontWeight: '700', color: node.color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>
                                            {node.role}
                                        </span>
                                        <span className="node-title" style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13.5px', fontWeight: '600', color: isHovered ? '#FFFFFF' : '#CBD5E1', textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
                                            {node.title}
                                        </span>
                                    </div>
                                </foreignObject>
                            ) : (
                                <foreignObject
                                    x={node.x - 80}
                                    y={node.y + circleRadius + 10}
                                    width={160}
                                    height={48}
                                    className="pointer-events-none overflow-visible"
                                >
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        pointerEvents: 'none'
                                    }}>
                                        <span className="node-role" style={{ fontSize: '11px', fontWeight: '700', color: node.color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>
                                            {node.role}
                                        </span>
                                        <span className="node-title" style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13.5px', fontWeight: '600', color: isHovered ? '#FFFFFF' : '#CBD5E1', textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
                                            {node.title}
                                        </span>
                                    </div>
                                </foreignObject>
                            )}
                        </g>
                    );
                })}

                {/* Center Core - AI WarRoom Engine */}
                <g 
                    className="cursor-pointer group focus:outline-none"
                    tabIndex={0}
                    role="button"
                    aria-label="WarRoom Core Orchestrator"
                    onMouseEnter={() => setHoveredNodeId('core')}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onFocus={() => setHoveredNodeId('core')}
                    onBlur={() => setHoveredNodeId(null)}
                    style={{
                        transform: hoveredNodeId === 'core' ? 'scale(1.05)' : 'scale(1)',
                        transformOrigin: `${centerNode.x}px ${centerNode.y}px`,
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        outline: 'none'
                    }}
                >
                    <motion.circle
                        cx={centerNode.x}
                        cy={centerNode.y}
                        r="54"
                        fill="none"
                        stroke="#00F2FE"
                        strokeWidth="1.5"
                        filter="url(#node-ring-glow)"
                        animate={{
                            r: isSimulating ? [54, 72, 54] : [54, 64, 54],
                            opacity: [0.7, 0.25, 0.7]
                        }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <circle
                        cx={centerNode.x}
                        cy={centerNode.y}
                        r="44"
                        fill="rgba(8, 11, 17, 0.96)"
                        stroke="rgba(0, 242, 254, 0.45)"
                        strokeWidth="2"
                    />

                    {/* Centered Core Icon */}
                    <foreignObject
                        x={centerNode.x - 44}
                        y={centerNode.y - 44}
                        width={88}
                        height={88}
                        className="pointer-events-none overflow-visible"
                    >
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none'
                        }}>
                            {centerNode.icon}
                        </div>
                    </foreignObject>

                    {/* Core Title Below */}
                    <foreignObject
                        x={centerNode.x - 100}
                        y={centerNode.y + 54}
                        width={200}
                        height={60}
                        className="pointer-events-none overflow-visible"
                    >
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            pointerEvents: 'none'
                        }}>
                            <span className="node-core-badge" style={{ fontSize: '11px', fontWeight: '700', color: '#00F2FE', background: 'rgba(0, 242, 254, 0.12)', border: '1px solid rgba(0, 242, 254, 0.35)', padding: '3px 14px', borderRadius: '999px', marginBottom: '4px', whiteSpace: 'nowrap', boxShadow: '0 0 12px rgba(0, 242, 254, 0.2)', letterSpacing: '0.04em' }}>
                                Orchestrator
                            </span>
                            <h4 className="node-core-title" style={{ fontFamily: 'var(--font-jakarta)', fontSize: '16px', fontWeight: '700', color: '#FFFFFF', margin: 0, textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)' }}>
                                WarRoom Core
                            </h4>
                        </div>
                    </foreignObject>
                </g>
            </svg>

            <style jsx>{`
                .warroom-canvas-container {
                    position: relative;
                    width: 100%;
                    max-width: 100%;
                    margin: 0 auto;
                    aspect-ratio: 800 / 610;
                    background: transparent;
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-radius: 32px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    box-shadow: 
                        0 24px 60px rgba(0, 0, 0, 0.65),
                        inset 0 1px 2px rgba(255, 255, 255, 0.16),
                        0 0 40px rgba(0, 242, 254, 0.05);
                    overflow: hidden;
                    user-select: none;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .warroom-canvas-container:hover,
                .warroom-canvas-container:focus-within {
                    background: transparent;
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border-color: rgba(0, 242, 254, 0.35);
                    box-shadow: 
                        0 30px 70px rgba(0, 0, 0, 0.8),
                        inset 0 1px 2px rgba(255, 255, 255, 0.22),
                        0 0 50px rgba(0, 242, 254, 0.12);
                }

                .warroom-svg {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: auto;
                    z-index: 1;
                }

                @media (max-width: 480px) {
                    .node-role {
                        font-size: 8px !important;
                    }
                    .node-title {
                        font-size: 10px !important;
                    }
                    .node-core-badge {
                        font-size: 8px !important;
                        padding: 2px 8px !important;
                    }
                    .node-core-title {
                        font-size: 12px !important;
                    }
                }
            `}</style>
        </div>
    );
}
