import './sat.css'

/* 400 → 1600 with one score marked. Our own drawing — deliberately not
   styled after any College Board score report. */
export default function ScoreScale({ mark = 1540, label = true }) {
  const pct = ((mark - 400) / 1200) * 100
  return (
    <div className="sscale" role="img" aria-label={`The SAT scale runs from 400 to 1600; ${mark} is marked.`}>
      <div className="sscale-mark" style={{ left: `${pct}%` }} aria-hidden>
        {label && <b>{mark}</b>}
        <i />
      </div>
      <div className="sscale-bar" aria-hidden />
      <div className="sscale-ticks" aria-hidden>
        {[400, 600, 800, 1000, 1200, 1400, 1600].map((t) => <span key={t}>{t}</span>)}
      </div>
    </div>
  )
}
