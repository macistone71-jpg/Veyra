import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity,
  Archive,
  Boxes,
  Check,
  ChevronRight,
  CircleHelp,
  Code2,
  Download,
  FileCheck2,
  Gamepad2,
  Gauge,
  Layers3,
  LoaderCircle,
  Pause,
  Play,
  Radar,
  RefreshCcw,
  Rocket,
  Settings2,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Volume2,
  Waves,
  X,
  Zap,
} from 'lucide-react';

type StageState = 'idle' | 'active' | 'done' | 'error';
type NavKey = 'forge' | 'assets' | 'proof';

const defaultBrief = '制作一个深海救援游戏：小鲨鱼穿过声呐区，收集能源泡泡，并避开废弃机械。';
const stageNames = ['解析创意', '构建规则', '绘制资产', '生成世界', '编写玩法', '质量验证'];
const sharkAssetUrl = './veyra-shark.webp';

const initialEvents = [
  { time: '00:00.12', title: '工作区已隔离', detail: 'reef-runner / local sandbox', tone: 'cyan' },
  { time: '00:00.31', title: '能力检查通过', detail: 'Canvas · Audio · Input', tone: 'amber' },
  { time: '00:00.56', title: '试玩舱待命', detail: '等待生成指令', tone: 'muted' },
];

function SharkMark({ compact = false }: { compact?: boolean }) {
  return <img className={compact ? 'shark-mark compact' : 'shark-mark'} src={sharkAssetUrl} width="694" height="900" fetchPriority="high" decoding="async" alt="Veyra 戴护目镜的小鲨鱼形象" />;
}

function SonarGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pressed = useRef(new Set<string>());
  const bounds = useRef({ width: 380, height: 250 });
  const state = useRef({ x: 190, y: 130, score: 0, energy: 78, running: true, last: 0 });
  const bubbles = useRef([
    { x: 0.18, y: 0.3, r: 7, live: true },
    { x: 0.72, y: 0.2, r: 6, live: true },
    { x: 0.82, y: 0.68, r: 8, live: true },
    { x: 0.44, y: 0.76, r: 5, live: true },
  ]);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(78);

  const moveBy = useCallback((dx: number, dy: number) => {
    const s = state.current;
    if (!s.running) return;
    s.x = Math.max(38, Math.min(bounds.current.width - 52, s.x + dx));
    s.y = Math.max(38, Math.min(bounds.current.height - 38, s.y + dy));
    bubbles.current.forEach((bubble) => {
      if (!bubble.live) return;
      const bx = bubble.x * bounds.current.width;
      const by = bubble.y * bounds.current.height;
      if (Math.hypot(s.x - bx, s.y - by) < 42) {
        bubble.live = false;
        s.score += 25;
        s.energy = Math.min(100, s.energy + 5);
        setScore(s.score);
        setEnergy(s.energy);
      }
    });
  }, []);

  const reset = useCallback(() => {
    state.current = { x: 190, y: 130, score: 0, energy: 78, running: true, last: 0 };
    bubbles.current.forEach((item) => { item.live = true; });
    setScore(0);
    setEnergy(78);
    setRunning(true);
  }, []);

  useEffect(() => {
    state.current.running = running;
  }, [running]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(event.key)) {
        event.preventDefault();
        const key = event.key.toLowerCase();
        if (!event.repeat) {
          if (key === 'arrowleft' || key === 'a') moveBy(-14, 0);
          if (key === 'arrowright' || key === 'd') moveBy(14, 0);
          if (key === 'arrowup' || key === 'w') moveBy(0, -14);
          if (key === 'arrowdown' || key === 's') moveBy(0, 14);
        }
        pressed.current.add(key);
      }
    };
    const up = (event: KeyboardEvent) => pressed.current.delete(event.key.toLowerCase());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [moveBy]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0;
    let width = 0;
    let height = 0;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(280, rect.width);
      height = Math.max(250, rect.height);
      bounds.current = { width, height };
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      state.current.x = Math.min(state.current.x, width - 40);
      state.current.y = Math.min(state.current.y, height - 30);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    resize();

    const sharkSprite = new Image();
    sharkSprite.src = sharkAssetUrl;
    const drawShark = (x: number, y: number) => {
      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#35dce7';
      if (sharkSprite.complete && sharkSprite.naturalWidth > 0) {
        ctx.drawImage(sharkSprite, x - 35, y - 47, 70, 91);
      }
      ctx.restore();
    };

    const render = (time: number) => {
      const s = state.current;
      const dt = Math.min((time - (s.last || time)) / 1000, 0.04);
      s.last = time;
      if (s.running) {
        const speed = 155 * dt;
        if (pressed.current.has('arrowleft') || pressed.current.has('a')) s.x -= speed;
        if (pressed.current.has('arrowright') || pressed.current.has('d')) s.x += speed;
        if (pressed.current.has('arrowup') || pressed.current.has('w')) s.y -= speed;
        if (pressed.current.has('arrowdown') || pressed.current.has('s')) s.y += speed;
        s.x = Math.max(38, Math.min(width - 52, s.x));
        s.y = Math.max(38, Math.min(height - 38, s.y));
      }
      ctx.clearRect(0, 0, width, height);
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, '#06151c'); bg.addColorStop(1, '#071016');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(69, 215, 226, .08)'; ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 42) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
      for (let y = 0; y < height; y += 42) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(243, 164, 54, .13)';
      for (let r = 65; r < Math.max(width, height); r += 65) { ctx.beginPath(); ctx.arc(width * .86, height * .18, r, 0, Math.PI * 2); ctx.stroke(); }
      const sweep = time / 1500;
      ctx.strokeStyle = 'rgba(243, 164, 54, .45)'; ctx.beginPath(); ctx.moveTo(width * .86, height * .18); ctx.lineTo(width * .86 + Math.cos(sweep) * 110, height * .18 + Math.sin(sweep) * 110); ctx.stroke();

      bubbles.current.forEach((bubble) => {
        if (!bubble.live) return;
        const bx = bubble.x * width;
        const by = bubble.y * height;
        ctx.shadowBlur = 14; ctx.shadowColor = '#f2a536';
        ctx.fillStyle = '#f6b84e'; ctx.beginPath(); ctx.arc(bx, by, bubble.r + Math.sin(time / 250) * 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(246,184,78,.38)'; ctx.beginPath(); ctx.arc(bx, by, bubble.r + 8, 0, Math.PI * 2); ctx.stroke();
        if (s.running && Math.hypot(s.x - bx, s.y - by) < 38) {
          bubble.live = false;
          s.score += 25; s.energy = Math.min(100, s.energy + 5);
          setScore(s.score); setEnergy(s.energy);
        }
      });
      ctx.shadowBlur = 0;
      drawShark(s.x, s.y);
      if (!s.running) {
        ctx.fillStyle = 'rgba(4, 12, 16, .74)'; ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#eefcff'; ctx.font = '600 18px ui-monospace'; ctx.textAlign = 'center';
        ctx.fillText('试玩已暂停', width / 2, height / 2);
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  const nudge = (key: string) => {
    if (key === 'arrowleft') moveBy(-22, 0);
    if (key === 'arrowright') moveBy(22, 0);
    if (key === 'arrowup') moveBy(0, -22);
    if (key === 'arrowdown') moveBy(0, 22);
    pressed.current.add(key);
    window.setTimeout(() => pressed.current.delete(key), 180);
  };

  return (
    <section className="panel preview-panel" aria-labelledby="preview-heading">
      <div className="panel-head">
        <div>
          <span className="eyebrow">LIVE SANDBOX / 01</span>
          <h2 id="preview-heading">深海声呐试玩舱</h2>
        </div>
        <div className="preview-actions">
          <button className="icon-button" onClick={() => setRunning((value) => !value)} aria-label={running ? '暂停试玩' : '继续试玩'}>
            {running ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button className="icon-button" onClick={reset} aria-label="重新开始试玩"><RefreshCcw size={18} /></button>
        </div>
      </div>
      <div className="game-hud" aria-live="polite">
        <span><Zap size={14} /> 能量 {energy}%</span>
        <span><Radar size={14} /> 回收 {score}</span>
        <span className="hud-status"><span className="status-dot" /> 系统在线</span>
      </div>
      <div className="game-wrap" ref={wrapRef}>
        <canvas ref={canvasRef} tabIndex={0} role="img" aria-label="可玩的深海小鲨鱼游戏。使用方向键或 W A S D 移动并收集橙色能源泡泡。" />
        <div className="game-caption">点击试玩舱后，用方向键 / W A S D 控制小鲨鱼</div>
        <div className="touch-pad" aria-label="触控方向键">
          <button onPointerDown={() => nudge('arrowup')} aria-label="向上">↑</button>
          <button onPointerDown={() => nudge('arrowleft')} aria-label="向左">←</button>
          <button onPointerDown={() => nudge('arrowdown')} aria-label="向下">↓</button>
          <button onPointerDown={() => nudge('arrowright')} aria-label="向右">→</button>
        </div>
      </div>
    </section>
  );
}

function AssetView() {
  const assets = [
    { name: '护目镜小鲨鱼', type: '角色主资产', icon: Waves, meta: '用户提供形象 · 透明背景优化' },
    { name: '深海声呐网格', type: '程序化背景', icon: Radar, meta: 'Canvas · 0 KB' },
    { name: '能源泡泡', type: '粒子组件', icon: Sparkles, meta: '实时渲染 · 可复用' },
    { name: '收集反馈音', type: '音频节点', icon: Volume2, meta: 'Web Audio · 待接入' },
  ];
  return (
    <section className="view-stack" aria-labelledby="assets-heading">
      <header className="view-header"><div><span className="eyebrow">ASSET BAY / 04</span><h1 id="assets-heading">资产舱</h1><p>角色统一采用用户提供的护目镜小鲨鱼；场景与粒子由程序化方式绘制。</p></div><span className="big-index">04</span></header>
      <div className="asset-grid">
        {assets.map(({ name, type, icon: Icon, meta }, index) => (
          <article className="asset-card" key={name}>
            <div className="asset-visual"><Icon aria-hidden="true" /><span>0{index + 1}</span>{index === 0 && <SharkMark compact />}</div>
            <div className="asset-copy"><span className="eyebrow">{type}</span><h2>{name}</h2><p>{meta}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProofView() {
  const checks = [
    ['来源可追溯', '角色形象由用户提供，其余场景与交互在当前仓库实现'],
    ['响应式门禁', '桌面、平板与 390px 布局均纳入验收'],
    ['可访问输入', '键盘、触控按钮与可见焦点并存'],
    ['构建产物', 'Vite 生成静态站点，可部署至 GitHub Pages'],
  ];
  return (
    <section className="view-stack" aria-labelledby="proof-heading">
      <header className="view-header"><div><span className="eyebrow">PROOF GATE / PASS</span><h1 id="proof-heading">作品证据链</h1><p>面试展示的不只是视觉稿，而是一条可解释、可运行、可检查的产品链路。</p></div><ShieldCheck className="proof-hero-icon" aria-hidden="true" /></header>
      <div className="proof-grid">
        {checks.map(([title, copy], index) => <article className="proof-card" key={title}><span className="proof-number">0{index + 1}</span><Check aria-hidden="true" /><h2>{title}</h2><p>{copy}</p></article>)}
      </div>
      <div className="panel provenance"><FileCheck2 aria-hidden="true" /><div><h2>项目说明</h2><p>Veyra 为从零实现的独立作品。产品概念研究参考 Noobi.ai 的公开介绍，但未复制该项目代码、视觉资产或品牌。</p></div></div>
    </section>
  );
}

export default function App() {
  const [nav, setNav] = useState<NavKey>('forge');
  const [brief, setBrief] = useState(() => localStorage.getItem('veyra-brief') || defaultBrief);
  const [stages, setStages] = useState<StageState[]>(stageNames.map(() => 'idle'));
  const [building, setBuilding] = useState(false);
  const [message, setMessage] = useState('');
  const [events, setEvents] = useState(initialEvents);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => { localStorage.setItem('veyra-brief', brief); }, [brief]);
  useEffect(() => {
    if (!helpOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setHelpOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [helpOpen]);

  const runBuild = useCallback(() => {
    if (!brief.trim()) {
      setMessage('请先写下游戏创意，再启动铸造流程。');
      document.getElementById('game-brief')?.focus();
      return;
    }
    setMessage(''); setBuilding(true);
    const next: StageState[] = stageNames.map(() => 'idle');
    next[0] = 'active'; setStages(next);
    setEvents([{ time: 'NOW', title: '收到新的铸造任务', detail: brief.slice(0, 30), tone: 'cyan' }, ...initialEvents]);
    let cursor = 0;
    const timer = window.setInterval(() => {
      const finishedIndex = cursor;
      setStages((current) => {
        const updated = [...current];
        updated[finishedIndex] = 'done';
        if (finishedIndex + 1 < updated.length) updated[finishedIndex + 1] = 'active';
        return updated;
      });
      setEvents((current) => [{ time: `00:0${finishedIndex + 1}.${12 + finishedIndex * 7}`, title: `${stageNames[finishedIndex]}完成`, detail: finishedIndex === 5 ? '证明门禁已通过' : '产物已写入本地工作区', tone: finishedIndex === 5 ? 'amber' : 'cyan' }, ...current].slice(0, 7));
      cursor = finishedIndex + 1;
      if (cursor >= stageNames.length) {
        window.clearInterval(timer); setBuilding(false); setMessage('铸造完成：试玩舱与证明报告已同步。');
      }
    }, 620);
  }, [brief]);

  useEffect(() => {
    const launchFromKeyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !building) {
        event.preventDefault();
        runBuild();
      }
    };
    window.addEventListener('keydown', launchFromKeyboard);
    return () => window.removeEventListener('keydown', launchFromKeyboard);
  }, [building, runBuild]);

  const exportReport = () => {
    const report = `VEYRA / BUILD REPORT\n\n创意：${brief}\n状态：${stages.every((stage) => stage === 'done') ? '验证通过' : '演示草稿'}\n角色：用户提供的护目镜小鲨鱼\n场景：程序化图形\n导出时间：${new Date().toLocaleString('zh-CN')}\n`;
    const url = URL.createObjectURL(new Blob([report], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'veyra-build-report.txt'; link.click(); URL.revokeObjectURL(url);
  };

  const navItems = [
    { key: 'forge' as const, label: '铸造台', icon: Gamepad2 },
    { key: 'assets' as const, label: '资产舱', icon: Boxes },
    { key: 'proof' as const, label: '证明链', icon: ShieldCheck },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setNav('forge')} aria-label="返回 Veyra 铸造台"><SharkMark compact /><span><strong>VEYRA</strong><small>GAME FORGE / 1.0</small></span></button>
        <div className="top-status"><span><span className="status-dot" /> LOCAL CORE</span><span className="hide-mobile">RENDER / 60 FPS</span></div>
        <div className="top-actions"><button className="text-button hide-mobile" onClick={exportReport}><Download size={16} /> 导出报告</button><button className="icon-button" onClick={() => setHelpOpen(true)} aria-label="打开操作帮助"><CircleHelp size={19} /></button></div>
      </header>

      <aside className="sidebar" aria-label="主导航">
        <div className="rail-label">MISSION CTRL</div>
        <nav>{navItems.map(({ key, label, icon: Icon }) => <button key={key} className={nav === key ? 'nav-item active' : 'nav-item'} onClick={() => setNav(key)} aria-current={nav === key ? 'page' : undefined}><Icon size={19} /><span>{label}</span><ChevronRight className="nav-arrow" size={15} /></button>)}</nav>
        <div className="mission-card"><span className="eyebrow">ACTIVE MISSION</span><SharkMark /><strong>REEF RUNNER</strong><small>深海救援 / 浏览器游戏</small><div className="mission-meter"><span style={{ width: building ? '64%' : stages.every((s) => s === 'done') ? '100%' : '18%' }} /></div></div>
        <button className="nav-item sidebar-bottom" onClick={() => setHelpOpen(true)}><Settings2 size={19} /><span>演示指南</span></button>
      </aside>

      <main id="main-content" tabIndex={-1}>
        {nav === 'assets' ? <AssetView /> : nav === 'proof' ? <ProofView /> : (
          <div className="workbench">
            <section className="command-hero" aria-labelledby="page-heading">
              <div className="hero-copy"><span className="eyebrow">GAME PRODUCTION DECK / READY</span><h1 id="page-heading">把一个点子，<br /><em>铸成可玩的世界。</em></h1><p>输入游戏创意，Veyra 会组织规则、资产、玩法与验证流程。右下方试玩舱可以直接操控小鲨鱼。</p></div>
              <div className="brief-console">
                <label htmlFor="game-brief"><TerminalSquare size={16} /> 游戏任务简报</label>
                <textarea id="game-brief" value={brief} onChange={(event) => setBrief(event.target.value)} rows={4} aria-describedby="brief-help brief-message" />
                <div className="console-foot"><small id="brief-help">自动保存到本机 · 不发送网络</small><button className="launch-button" onClick={runBuild} disabled={building}>{building ? <LoaderCircle className="spin" size={18} /> : <Rocket size={18} />}{building ? '正在铸造' : '启动铸造'}<span>⌘ ↵</span></button></div>
                <div id="brief-message" className={message.includes('请先') ? 'form-message error' : 'form-message'} aria-live="polite">{message}</div>
              </div>
              <div className="hero-ornament" aria-hidden="true"><span>SF</span><div /><small>DEPTH 0240M</small></div>
            </section>

            <section className="pipeline panel" aria-labelledby="pipeline-heading">
              <div className="panel-head"><div><span className="eyebrow">BUILD SEQUENCE / 06</span><h2 id="pipeline-heading">铸造流水线</h2></div><span className="pipeline-state">{building ? 'PROCESSING' : stages.every((stage) => stage === 'done') ? 'VERIFIED' : 'STANDBY'}</span></div>
              <ol className="stage-list">{stageNames.map((name, index) => {
                const StageIcon = [Activity, Layers3, Sparkles, Gauge, Code2, ShieldCheck][index];
                return <li key={name} className={`stage ${stages[index]}`}><span className="stage-index">0{index + 1}</span><div className="stage-icon">{stages[index] === 'done' ? <Check size={17} /> : stages[index] === 'active' ? <LoaderCircle className="spin" size={17} /> : <StageIcon size={17} />}</div><strong>{name}</strong><small>{stages[index] === 'done' ? '完成' : stages[index] === 'active' ? '处理中' : '待命'}</small></li>;
              })}</ol>
            </section>

            <div className="deck-grid">
              <SonarGame />
              <section className="panel event-panel" aria-labelledby="events-heading">
                <div className="panel-head"><div><span className="eyebrow">AGENT SIGNAL</span><h2 id="events-heading">任务信号流</h2></div><Activity size={19} aria-hidden="true" /></div>
                <div className="event-list" aria-live="polite">{events.map((event, index) => <article className="event" key={`${event.time}-${event.title}-${index}`}><span className={`event-mark ${event.tone}`} /><time>{event.time}</time><div><strong>{event.title}</strong><small>{event.detail}</small></div></article>)}</div>
                <div className="proof-gate"><ShieldCheck size={22} /><div><strong>PROOF GATE</strong><small>{stages.every((stage) => stage === 'done') ? '验证通过 · 可交付' : '等待流水线完成'}</small></div><span className={stages.every((stage) => stage === 'done') ? 'pass' : ''}>{stages.every((stage) => stage === 'done') ? 'PASS' : 'WAIT'}</span></div>
              </section>
            </div>
          </div>
        )}
      </main>

      {helpOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setHelpOpen(false); }}><section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title"><button className="modal-close" onClick={() => setHelpOpen(false)} aria-label="关闭帮助"><X size={20} /></button><span className="eyebrow">DEMO FLIGHT PLAN</span><h2 id="help-title">90 秒面试演示路径</h2><ol><li><span>01</span><div><strong>讲产品任务</strong><p>一句创意如何变成结构化、可验证的游戏产物。</p></div></li><li><span>02</span><div><strong>启动铸造</strong><p>点击主按钮，观察六阶段流程和实时信号。</p></div></li><li><span>03</span><div><strong>直接试玩</strong><p>用方向键控制小鲨鱼，收集橙色能源泡泡。</p></div></li><li><span>04</span><div><strong>展示证据</strong><p>切换到资产舱与证明链，说明原创与工程取舍。</p></div></li></ol><button className="launch-button full" onClick={() => setHelpOpen(false)}>开始演示 <Play size={17} /></button></section></div>}
    </div>
  );
}
