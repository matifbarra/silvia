// ─────────────────────────────────────────────────────────────
// AUTH SHELL — el marco compartido de Login y Register.
//
// A la izquierda (desktop) va la "tesis" de la página: silvIA como un
// sistema, presentada como una sesión de terminal (el mundo de un
// estudiante de sistemas). A la derecha, el formulario.
// En mobile solo se ve el formulario con la marca arriba.
// ─────────────────────────────────────────────────────────────

import { IconTerminal } from './icons';

// Cada línea del "readout" entra con un pequeño stagger (efecto de
// impresión en terminal). El caret parpadea al final.
const READOUT = [
  { dot: 'bg-mint-400', text: '5 materias listas para cursar' },
  { dot: 'bg-amber-400', text: '3 tareas vencen esta semana' },
  { dot: 'bg-brand-400', text: '47% de la carrera aprobada' },
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Panel de marca (solo desktop) ── */}
      <aside
        className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative overflow-hidden bg-slate-950 text-white"
        style={{
          backgroundImage:
            'radial-gradient(40rem 30rem at 20% 0%, rgba(95,109,244,0.25), transparent 60%), ' +
            'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), ' +
            'linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
          backgroundSize: 'auto, 34px 34px, 34px 34px',
        }}
      >
        <div className="flex items-center gap-2.5 relative">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-600/40">
            <IconTerminal className="w-6 h-6" />
          </span>
          <span className="text-xl font-bold tracking-tight">
            silv<span className="text-brand-400">IA</span>
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="eyebrow mb-4 text-brand-300/80">// el sistema de tu carrera</p>
          <h2 className="text-4xl xl:text-5xl font-bold leading-[1.05] tracking-tight">
            Compilá tu carrera,
            <br />
            materia por materia.
          </h2>
          <p className="mt-5 text-slate-400 leading-relaxed">
            Materias, tareas y correlativas en un solo lugar. silvIA lee tu plan
            como un grafo de dependencias y te dice, en cada momento, qué podés
            cursar y cuánto te falta.
          </p>

          {/* "Readout" de terminal: la propuesta de valor como estado del sistema */}
          <div className="mt-8 rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm p-4 font-mono text-sm">
            <p className="text-slate-500 mb-2">
              <span className="text-mint-400">~/silvIA</span> $ status
            </p>
            {READOUT.map((line, i) => (
              <p
                key={line.text}
                className="reveal flex items-center gap-2.5 py-0.5 text-slate-300"
                style={{ '--d': `${300 + i * 220}ms` }}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${line.dot}`} />
                {line.text}
              </p>
            ))}
            <p className="text-slate-500 mt-1">
              $ <span className="caret text-brand-400">_</span>
            </p>
          </div>
        </div>

        <p className="relative text-xs text-slate-600 font-mono">
          v1.0 · hecho para estudiantes de ingeniería
        </p>
      </aside>

      {/* ── Panel del formulario ── */}
      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm pop-in">
          {/* Marca (visible sobre todo en mobile, donde no está el panel) */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-600/25">
              <IconTerminal className="w-6 h-6" />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              silv<span className="text-brand-600 dark:text-brand-400">IA</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 mb-8">{subtitle}</p>

          {children}

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {footer}
          </div>
        </div>
      </main>
    </div>
  );
}
