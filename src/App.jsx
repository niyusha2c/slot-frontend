import { useState, useEffect, useRef, useCallback } from 'react';

function useDropSound() {
  const ctxRef = useRef(null);
  const play = useCallback(() => {
    try {
      const ctx = ctxRef.current || new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.type = 'sine';
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }, []);
  return play;
}

function GlobalDrops() {
  const [drops, setDrops] = useState([]);
  useEffect(() => {
    const tick = () => {
      const id = Date.now() + Math.random();
      setDrops(prev => [...prev.slice(-20), { id, x: Math.random() * 100, born: Date.now() }]);
      return setTimeout(tick, 800 + Math.random() * 2500);
    };
    const t = tick();
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const i = setInterval(() => {
      setDrops(prev => prev.filter(d => Date.now() - d.born < 4000));
    }, 500);
    return () => clearInterval(i);
  }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {drops.map(d => (
        <div key={d.id} style={{
          position: 'absolute', top: '-4px', left: `${d.x}%`,
          width: '3px', height: '3px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.06)',
          animation: 'dropFall 4s ease-in forwards',
        }} />
      ))}
    </div>
  );
}

function LiveCounter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const fetchCount = () => {
      fetch('https://slot-backend-production.up.railway.app/api/count')
        .then(r => {
          if (!r.ok) return null;
          return r.json();
        })
        .then(d => {
          if (d && typeof d.count === 'number') {
            setCount(d.count);
          }
        })
        .catch(() => {});
    };
    fetchCount();
    const i = setInterval(fetchCount, 15000);
    return () => clearInterval(i);
  }, []);
  return <span style={st.counter}>{count.toLocaleString()} today</span>;
}

function TimeDisplay() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const mid = new Date(); mid.setHours(24, 0, 0, 0);
      const d = mid - now;
      setTime(`${Math.floor(d / 3600000)}:${String(Math.floor((d % 3600000) / 60000)).padStart(2, '0')}`);
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);
  return <span>{time}</span>;
}

function getEventPos(e) {
  if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (e.changedTouches && e.changedTouches.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}

export default function App() {
  const [mode, setMode] = useState('type');
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [dropAnim, setDropAnim] = useState(null);
  const [hasPostedToday, setHasPostedToday] = useState(false);
  const [isNearSlot, setIsNearSlot] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [isDrawingStroke, setIsDrawingStroke] = useState(false);
  const [drawBounds, setDrawBounds] = useState(null);

  const textareaRef = useRef(null);
  const slotRef = useRef(null);
  const drawCanvasRef = useRef(null);

  const playDrop = useDropSound();
  const hasContent = mode === 'draw' ? strokes.length > 0 : message.trim().length > 0;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    fetch('https://slot-backend-production.up.railway.app/api/status')
      .then(r => r.json())
      .then(d => {
        setHasPostedToday(d.hasDroppedToday);
        setStreak(d.streak);
      })
      .catch(() => {});
  }, []);

  const computeDrawBounds = useCallback((allStrokes) => {
    const allPts = allStrokes.flat();
    if (!allPts.length) return null;
    const xs = allPts.map(p => p.x);
    const ys = allPts.map(p => p.y);
    return { minX: Math.min(...xs) - 10, minY: Math.min(...ys) - 10, maxX: Math.max(...xs) + 10, maxY: Math.max(...ys) + 10 };
  }, []);

  const handleClick = (e) => {
    if (hasPostedToday || isDragging || hasContent) return;
    if (e.target.closest('[data-controls]')) return;
    if (mode === 'draw') return;
    const p = getEventPos(e);
    setPosition(p);
    setMessage('');
    if (mode === 'type') setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleDrawStart = (e) => {
    if (hasPostedToday || isDragging || hasContent) return;
    if (e.target.closest('[data-controls]')) return;
    if (mode !== 'draw') return;
    const p = getEventPos(e);
    setIsDrawingStroke(true);
    setCurrentStroke([p]);
  };

  const handleDrawMove = (e) => {
    if (!isDrawingStroke) return;
    e.preventDefault();
    const p = getEventPos(e);
    setCurrentStroke(prev => [...prev, p]);
  };

  const handleDrawEnd = () => {
    if (!isDrawingStroke) return;
    setIsDrawingStroke(false);
    if (currentStroke.length > 1) {
      const next = [...strokes, currentStroke];
      setStrokes(next);
      setDrawBounds(computeDrawBounds(next));
    }
    setCurrentStroke([]);
  };

  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const all = [...strokes, ...(currentStroke.length > 1 ? [currentStroke] : [])];
    let ox = 0, oy = 0;
    if ((isDragging || dropAnim) && drawBounds) {
      const cx = (drawBounds.minX + drawBounds.maxX) / 2;
      const cy = (drawBounds.minY + drawBounds.maxY) / 2;
      const target = dropAnim || dragPos;
      ox = target.x - cx; oy = target.y - cy;
    }
    if (dropAnim) ctx.globalAlpha = 0.3;
    for (const stroke of all) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x + ox, stroke[0].y + oy);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x + ox, stroke[i].y + oy);
      ctx.stroke();
    }
  }, [strokes, currentStroke, isDragging, dragPos, dropAnim, drawBounds]);

  const handleDragStart = (e) => {
    if (!hasContent) return;
    e.preventDefault();
    setIsDragging(true);
    const p = getEventPos(e);
    if (mode === 'draw' && drawBounds) {
      setDragPos({ x: (drawBounds.minX + drawBounds.maxX) / 2, y: (drawBounds.minY + drawBounds.maxY) / 2 });
    } else {
      setDragPos(p);
    }
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const onMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const p = getEventPos(e);
    setDragPos(p);
    if (slotRef.current) {
      const r = slotRef.current.getBoundingClientRect();
      setIsNearSlot(Math.abs(p.y - r.top) < 80);
    }
  }, [isDragging]);

  const onUp = useCallback(() => {
    if (!isDragging) return;
    if (isNearSlot && hasContent && slotRef.current) {
      const r = slotRef.current.getBoundingClientRect();
      setDropAnim({ x: r.left + r.width / 2, y: r.top });
      setIsDragging(false);
      setIsNearSlot(false);
      playDrop();
      if (navigator.vibrate) navigator.vibrate([20, 50, 20]);

      fetch('https://slot-backend-production.up.railway.app/api/drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, charCount: message.length }),
      }).catch(() => {});

      setTimeout(() => {
        setHasPostedToday(true);
        setMessage(''); setStrokes([]); setDrawBounds(null);
        setPosition(null); setDropAnim(null);
        setStreak(s => s + 1);
      }, 500);
    } else {
      setIsDragging(false);
      setIsNearSlot(false);
    }
  }, [isDragging, isNearSlot, hasContent, playDrop, mode, message.length]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onUp);
      };
    }
  }, [isDragging, onMove, onUp]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setPosition(null); setMessage(''); setStrokes([]);
      setDrawBounds(null); setIsDrawingStroke(false);
    }
  };

  const resetAll = () => {
    setPosition(null); setMessage(''); setStrokes([]);
    setDrawBounds(null); setIsDrawingStroke(false);
  };

  const pos = dropAnim ? dropAnim : isDragging ? dragPos : position;
  const month = new Date().getMonth();
  const accent = month < 2 || month > 10 ? '#8aa4bf' : month < 5 ? '#7ab87a' : month < 8 ? '#e8c84a' : '#c47a4a';

  return (
    <div
      style={st.container}
      onClick={handleClick}
      onMouseDown={mode === 'draw' ? handleDrawStart : undefined}
      onMouseMove={mode === 'draw' && isDrawingStroke ? handleDrawMove : undefined}
      onMouseUp={mode === 'draw' && isDrawingStroke ? handleDrawEnd : undefined}
      onTouchStart={mode === 'draw' ? handleDrawStart : undefined}
      onTouchMove={mode === 'draw' && isDrawingStroke ? handleDrawMove : undefined}
      onTouchEnd={mode === 'draw' && isDrawingStroke ? handleDrawEnd : undefined}
    >
      <GlobalDrops />
      {mode === 'draw' && (
        <canvas ref={drawCanvasRef} style={{
          position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
          opacity: dropAnim ? 0 : 1, transition: dropAnim ? 'opacity 0.4s ease' : 'none',
        }} />
      )}

      <header style={st.header}>
        <div style={st.headerLeft}>
          <span style={st.title}>slot.</span>
          <LiveCounter />
        </div>
        <div style={st.headerRight}>
          {streak > 0 && !hasPostedToday && <span style={st.streak}>{streak}d</span>}
          {hasPostedToday && <TimeDisplay />}
        </div>
      </header>

      <div style={st.slotWrapper}>
        <div ref={slotRef} style={{
          ...st.slot,
          ...(isNearSlot ? { height: '4px', boxShadow: `0 0 24px ${accent}40` } : {}),
          ...(dropAnim ? { height: '8px', background: accent } : {}),
        }} />
      </div>

      {!position && !hasPostedToday && strokes.length === 0 && (
        <p style={st.hint}>
          {mode === 'type' ? (isMobile ? 'tap anywhere' : 'click anywhere')
            : mode === 'speak' ? (isMobile ? 'tap anywhere' : 'click anywhere')
            : 'draw anywhere'}
        </p>
      )}
      {hasPostedToday && !dropAnim && <p style={st.hint}>gone</p>}

      {pos && !hasPostedToday && (mode === 'type' || mode === 'speak') && (
        <div data-text style={{
          ...st.textWrapper,
          left: isMobile ? '50%' : pos.x,
          top: isMobile ? '40%' : pos.y,
          width: isMobile ? '85%' : 'auto',
          transform: `translate(-50%, -50%) scale(${dropAnim ? 0.4 : 1})`,
          opacity: dropAnim ? 0 : 1,
          cursor: hasContent ? (isDragging ? 'grabbing' : 'grab') : 'text',
          transition: dropAnim ? 'all 0.4s cubic-bezier(0.4,0,0.2,1)' : 'none',
        }}
          onMouseDown={hasContent ? handleDragStart : undefined}
          onTouchStart={hasContent ? handleDragStart : undefined}
        >
          <textarea
            ref={textareaRef}
            style={{
              ...st.textarea,
              width: isMobile ? '100%' : '240px',
              pointerEvents: isDragging ? 'none' : 'auto',
              fontSize: isMobile ? '18px' : '16px',
            }}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 200))}
            onKeyDown={handleKeyDown}
            placeholder="..."
            autoFocus
          />
          {hasContent && !isDragging && (
            <span style={st.dragHint}>{isMobile ? 'drag to slot ↑' : 'drag to slot'}</span>
          )}
        </div>
      )}

      {mode === 'draw' && drawBounds && !isDragging && !dropAnim && strokes.length > 0 && !hasPostedToday && (
        <div data-text style={{
          position: 'fixed',
          left: (drawBounds.minX + drawBounds.maxX) / 2,
          top: drawBounds.maxY + 16,
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          zIndex: 10, cursor: 'grab', padding: '12px 20px',
        }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <span style={st.dragHint}>drag to slot ↑</span>
        </div>
      )}

      {!hasPostedToday && (
        <div data-controls style={{ ...st.modeBar, bottom: isMobile ? '32px' : '56px' }}>
          {['type', 'speak', 'draw'].map(m => (
            <button key={m}
              style={{
                ...st.modeBtn,
                ...(mode === m ? st.modeBtnActive : {}),
                padding: isMobile ? '10px 20px' : '8px 18px',
                fontSize: isMobile ? '13px' : '12px',
              }}
              onClick={(e) => { e.stopPropagation(); setMode(m); resetAll(); }}
            >{m}</button>
          ))}
        </div>
      )}

      <footer style={{ ...st.footer, bottom: isMobile ? '12px' : '24px' }}>
  <a href="/about" style={st.footerLink}>about</a>
</footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { background: #fafafa; overflow: hidden; -webkit-tap-highlight-color: transparent; }
        textarea:focus { outline: none; }
        textarea::placeholder { color: #ccc; }
        @keyframes dropFall {
          0% { transform: translateY(0); opacity: 0.6; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const st = {
  container: { height: '100vh', background: '#fafafa', fontFamily: '"Outfit", sans-serif', color: '#000', position: 'relative', userSelect: 'none', cursor: 'crosshair', touchAction: 'none' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', position: 'relative', zIndex: 5 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  title: { fontSize: '18px', fontWeight: 500, letterSpacing: '-0.02em' },
  counter: { fontSize: '12px', color: '#bbb', fontWeight: 300 },
  streak: { fontSize: '12px', color: '#bbb', fontWeight: 300 },
  slotWrapper: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 },
  slot: { width: '200px', height: '2px', background: '#000', transition: 'all 0.25s ease' },
  hint: { position: 'absolute', top: 'calc(50% + 20px)', left: '50%', transform: 'translateX(-50%)', fontSize: '13px', color: '#ccc', pointerEvents: 'none', zIndex: 2, fontWeight: 300, whiteSpace: 'nowrap' },
  textWrapper: { position: 'fixed', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 10 },
  textarea: { width: '240px', minHeight: '60px', padding: '0', border: 'none', background: 'transparent', fontFamily: '"Outfit", sans-serif', fontSize: '16px', fontWeight: 300, lineHeight: 1.6, color: '#000', resize: 'none', textAlign: 'center' },
  dragHint: { fontSize: '11px', color: '#ccc', fontWeight: 300 },
  modeBar: { position: 'absolute', bottom: '56px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px', background: '#f0f0f0', borderRadius: '20px', padding: '3px', zIndex: 5 },
  modeBtn: { padding: '8px 18px', background: 'transparent', border: 'none', borderRadius: '18px', fontFamily: '"Outfit", sans-serif', fontSize: '12px', fontWeight: 400, color: '#999', cursor: 'pointer', transition: 'all 0.2s ease' },
  modeBtnActive: { background: '#fff', color: '#000', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  footer: { position: 'absolute', bottom: '24px', left: '0', right: '0', textAlign: 'center', fontSize: '11px', color: '#ddd', fontWeight: 300, pointerEvents: 'none' },
  footerLink: { color: '#ccc', textDecoration: 'none', fontSize: '11px', fontWeight: 300, pointerEvents: 'auto' },
};