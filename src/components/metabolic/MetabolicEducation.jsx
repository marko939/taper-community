'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { TIERS, MODULES, getModulesByTier } from '@/lib/metabolic/education';

const TEAL = '#0D9488';
const TEAL_DARK = '#0F766E';
const TEAL_BG = '#F0FDFA';
const TEAL_LIGHT = '#CCFBF1';
const BORDER = '#E8E5F0';
const TEXT = '#1E1B2E';
const MUTED = '#6B6580';
const SUBTLE = '#9B95A8';
const SURFACE = '#ffffff';
const BG = '#F6F4FA';

const TIER_COLORS = {
  green: { color: '#166534', bg: '#DCFCE7', border: '#BBF7D0' },
  amber: { color: '#92400E', bg: '#FEF3C7', border: '#FDE68A' },
  red: { color: '#991B1B', bg: '#FEE2E2', border: '#FECACA' },
};

// Quiz component — stateful per question set
function QuizBlock({ questions }) {
  const [answers, setAnswers] = useState({});

  const score = Object.entries(answers).filter(([qi, chosen]) => questions[Number(qi)].correct === chosen).length;
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div style={{ marginTop: 8 }}>
      {questions.map((q, qi) => {
        const chosen = answers[qi];
        const answered = chosen !== undefined;
        const isCorrect = answered && chosen === q.correct;

        return (
          <div key={qi} style={{
            background: BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            padding: '18px 20px',
            marginBottom: 20,
          }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: TEXT, margin: '0 0 14px', lineHeight: 1.5 }}>
              {qi + 1}. {q.text}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.options.map((opt, oi) => {
                let bg = SURFACE;
                let borderColor = BORDER;
                let color = MUTED;
                if (answered) {
                  if (oi === q.correct) { bg = '#DCFCE7'; borderColor = '#16A34A'; color = '#15803D'; }
                  else if (oi === chosen && !isCorrect) { bg = '#FEE2E2'; borderColor = '#DC2626'; color = '#991B1B'; }
                }
                return (
                  <button
                    key={oi}
                    disabled={answered}
                    onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: `1.5px solid ${borderColor}`,
                      background: bg,
                      color,
                      fontSize: 14,
                      cursor: answered ? 'default' : 'pointer',
                      lineHeight: 1.5,
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div style={{
                marginTop: 12,
                background: isCorrect ? '#F0FDFA' : '#FFF7ED',
                border: `1px solid ${isCorrect ? TEAL_LIGHT : '#FED7AA'}`,
                borderRadius: 10,
                padding: '10px 14px',
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: isCorrect ? TEAL_DARK : '#C2410C', margin: '0 0 4px' }}>
                  {isCorrect ? '✓ Correct' : '✗ Not quite'}
                </p>
                <p style={{ fontSize: 13, color: isCorrect ? TEAL_DARK : '#9A3412', margin: 0, lineHeight: 1.6 }}>
                  {q.explanation}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {allAnswered && (
        <div style={{
          background: TEAL_BG,
          border: `1px solid ${TEAL_LIGHT}`,
          borderRadius: 14,
          padding: '16px 20px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: TEAL_DARK, margin: '0 0 4px' }}>
            {score} / {questions.length}
          </p>
          <p style={{ fontSize: 13, color: TEAL_DARK, margin: 0 }}>
            {score === questions.length
              ? 'Perfect score — you\'re ready for the next tier!'
              : score >= questions.length * 0.75
              ? 'Great work — you have a solid understanding of these concepts.'
              : 'Review the modules above and revisit the questions — the concepts build on each other.'}
          </p>
        </div>
      )}
    </div>
  );
}

function ContentBlock({ block, quizState }) {
  if (block.type === 'objectives') {
    return (
      <div style={{
        background: 'var(--purple-ghost, #F5F0FF)',
        border: '1px solid var(--purple-pale, #DDD6FE)',
        borderRadius: 12,
        padding: '14px 18px',
        margin: '0 0 24px',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#7C3AED', margin: '0 0 10px' }}>
          Learning objectives
        </p>
        <ol style={{ paddingLeft: 18, margin: 0 }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ fontSize: 14, color: '#4C1D95', lineHeight: 1.6, marginBottom: 4 }}>{item}</li>
          ))}
        </ol>
      </div>
    );
  }

  if (block.type === 'takeaways') {
    return (
      <div style={{
        background: TEAL_BG,
        border: `1px solid ${TEAL_LIGHT}`,
        borderRadius: 12,
        padding: '14px 18px',
        margin: '24px 0 16px',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: TEAL_DARK, margin: '0 0 10px' }}>
          Key takeaways
        </p>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ fontSize: 14, color: TEAL_DARK, lineHeight: 1.6, marginBottom: 4 }}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (block.type === 'h3') {
    return (
      <h3 style={{
        fontFamily: 'Fraunces, Georgia, serif',
        fontSize: 18,
        fontWeight: 700,
        color: TEXT,
        margin: '28px 0 10px',
        lineHeight: 1.3,
      }}>
        {block.text}
      </h3>
    );
  }

  if (block.type === 'warning') {
    return (
      <div style={{
        background: '#FFFBEB',
        borderLeft: '4px solid #F59E0B',
        borderRadius: 12,
        padding: '14px 18px',
        margin: '16px 0',
      }}>
        <p style={{ color: '#92400E', fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>⚠ {block.title}</p>
        <p style={{ color: '#78350F', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{block.text}</p>
      </div>
    );
  }

  if (block.type === 'pearl') {
    return (
      <div style={{
        background: TEAL_BG,
        borderLeft: `4px solid ${TEAL}`,
        borderRadius: 12,
        padding: '14px 18px',
        margin: '16px 0',
      }}>
        <p style={{ color: TEAL_DARK, fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>💡 {block.title}</p>
        <p style={{ color: TEAL_DARK, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{block.text}</p>
      </div>
    );
  }

  if (block.type === 'scenario') {
    return (
      <div style={{
        background: 'var(--purple-ghost, #F5F0FF)',
        border: '1px solid var(--purple-pale, #DDD6FE)',
        borderRadius: 12,
        padding: '14px 18px',
        margin: '16px 0',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#7C3AED', margin: '0 0 8px' }}>
          {block.name}
        </p>
        <p style={{ color: '#4C1D95', fontSize: 14, lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>{block.text}</p>
      </div>
    );
  }

  if (block.type === 'p') {
    return (
      <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7, margin: '0 0 16px' }}>
        {block.bold && <strong style={{ color: TEXT }}>{block.bold}</strong>}
        {block.text}
      </p>
    );
  }

  if (block.type === 'callout') {
    return (
      <div style={{
        background: TEAL_BG,
        borderLeft: `4px solid ${TEAL}`,
        borderRadius: 12,
        padding: '14px 18px',
        margin: '16px 0',
      }}>
        <p style={{ color: TEAL_DARK, fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>{block.title}</p>
        <p style={{ color: TEAL_DARK, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{block.text}</p>
      </div>
    );
  }

  if (block.type === 'list') {
    return (
      <div style={{ margin: '16px 0' }}>
        {block.title && <p style={{ color: TEXT, fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>{block.title}</p>}
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, marginBottom: 4 }}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (block.type === 'video') {
    return (
      <div style={{
        background: '#F8FAFC',
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        overflow: 'hidden',
        margin: '20px 0',
      }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
          <iframe
            src={`https://www.youtube.com/embed/${block.videoId}?start=${block.start || 0}${block.end ? `&end=${block.end}` : ''}&rel=0`}
            title={block.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          />
        </div>
        <div style={{ padding: '12px 16px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: TEXT, margin: '0 0 4px' }}>{block.title}</p>
          <p style={{ fontSize: 12, color: MUTED, margin: '0 0 4px', lineHeight: 1.5 }}>{block.desc}</p>
          <p style={{ fontSize: 11, color: SUBTLE, margin: 0 }}>{block.source} · {block.time}</p>
        </div>
      </div>
    );
  }

  if (block.type === 'sources') {
    return (
      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16, marginTop: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: SUBTLE, margin: '0 0 8px' }}>Sources</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {block.items.map((src) => (
            <li key={src.url} style={{ marginBottom: 4 }}>
              <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: TEAL, textDecoration: 'none' }}>
                {src.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // 'question' blocks are handled at module level via QuizBlock, not individually
  return null;
}

export default function MetabolicEducation() {
  const [activeModule, setActiveModule] = useState(MODULES[0]?.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1200);
  const contentRef = useRef(null);

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const isSmall = viewportWidth <= 900;
  const currentModule = MODULES.find((m) => m.id === activeModule) || MODULES[0];
  const currentTier = TIERS.find((t) => t.id === currentModule.tier);
  const currentIndex = MODULES.indexOf(currentModule);

  function selectModule(id) {
    setActiveModule(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Extract question blocks from assessment modules
  const questions = currentModule.isAssessment
    ? currentModule.content.filter((b) => b.type === 'question')
    : [];

  const sidebarContent = (
    <div style={{ padding: '16px 12px' }}>
      <div style={{ padding: '0 8px 16px', borderBottom: `1px solid ${BORDER}` }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0, fontFamily: 'Fraunces, Georgia, serif' }}>
          Metabolic Health
        </p>
        <p style={{ fontSize: 12, color: SUBTLE, margin: '4px 0 0' }}>Education Hub</p>
      </div>
      {TIERS.map((tier) => {
        const tierColor = TIER_COLORS[tier.color];
        const modules = getModulesByTier(tier.id);
        return (
          <div key={tier.id} style={{ marginTop: 16 }}>
            <p style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: tierColor.color,
              padding: '0 8px',
              margin: '0 0 6px',
            }}>
              {tier.label}
            </p>
            {modules.map((mod) => {
              const isActive = mod.id === activeModule;
              return (
                <button
                  key={mod.id}
                  onClick={() => selectModule(mod.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 10px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive ? TEAL_BG : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? TEAL_DARK : MUTED,
                    lineHeight: 1.4,
                  }}>
                    {mod.title}
                  </span>
                  {mod.duration && (
                    <span style={{ fontSize: 11, color: SUBTLE, marginTop: 1, display: 'block' }}>
                      {mod.duration}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', padding: '0 32px 32px' }}>
      {/* Sticky module sidebar */}
      {!isSmall && (
        <div style={{
          width: 240,
          flexShrink: 0,
          position: 'sticky',
          top: 16,
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          background: BG,
          borderRadius: 12,
          border: `1px solid ${BORDER}`,
        }}>
          {sidebarContent}
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top bar */}
        <div style={{
          padding: '10px 0 10px',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
        }}>
          {isSmall && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none',
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: 12,
                color: MUTED,
                flexShrink: 0,
              }}
            >
              Modules
            </button>
          )}
          {currentTier && (
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 99,
              background: TIER_COLORS[currentTier.color].bg,
              color: TIER_COLORS[currentTier.color].color,
              border: `1px solid ${TIER_COLORS[currentTier.color].border}`,
              flexShrink: 0,
            }}>
              {currentTier.label}
            </span>
          )}
          <span style={{ fontSize: 13, color: MUTED, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentModule.title}
          </span>
          <span style={{ fontSize: 12, color: SUBTLE, flexShrink: 0 }}>
            {currentIndex + 1} / {MODULES.length}
          </span>
        </div>

        {/* Mobile sidebar overlay */}
        {isSmall && sidebarOpen && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.3)' }}
            onClick={() => setSidebarOpen(false)}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: 290,
                background: SURFACE,
                overflowY: 'auto',
                boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {sidebarContent}
            </div>
          </div>
        )}

        {/* Content area */}
        <div
          ref={contentRef}
          style={{
            padding: 0,
            maxWidth: 680,
          }}
        >
          {/* Module title + reading time */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{
              fontSize: isSmall ? 22 : 26,
              fontWeight: 700,
              color: TEXT,
              margin: '0 0 6px',
              fontFamily: 'Fraunces, Georgia, serif',
              lineHeight: 1.3,
            }}>
              {currentModule.title}
            </h1>
            {currentModule.duration && (
              <p style={{ fontSize: 13, color: SUBTLE, margin: 0 }}>
                ⏱ {currentModule.duration} read
              </p>
            )}
          </div>

          {/* Non-question content blocks */}
          {currentModule.content
            .filter((b) => b.type !== 'question')
            .map((block, i) => (
              <ContentBlock key={i} block={block} />
            ))}

          {/* Quiz section for assessment modules */}
          {currentModule.isAssessment && questions.length > 0 && (
            <QuizBlock key={currentModule.id} questions={questions} />
          )}

          {/* Nav buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 40,
            paddingTop: 20,
            borderTop: `1px solid ${BORDER}`,
            gap: 12,
          }}>
            {currentIndex > 0 ? (
              <button
                onClick={() => selectModule(MODULES[currentIndex - 1].id)}
                style={{
                  background: 'none',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 10,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: MUTED,
                }}
              >
                ← Previous
              </button>
            ) : <div />}
            {currentIndex < MODULES.length - 1 ? (
              <button
                onClick={() => selectModule(MODULES[currentIndex + 1].id)}
                style={{
                  background: TEAL,
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                Next →
              </button>
            ) : (
              <div style={{ fontSize: 13, color: TEAL_DARK, fontWeight: 600, padding: '10px 0' }}>
                🎉 You've completed the Education Hub
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
