import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './Tool.css';

/* ───────  Sun icon  ─────── */
const SunIcon = ({ size = 56 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    style={{ color: '#facc15' }}
  >
    <circle cx="12" cy="12" r="5" />
    <g stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
    </g>
  </svg>
);

/* ───────  Sequential PV Savings Tool  ─────── */
export default function Tool() {
  const navigate = useNavigate();
  const closeModal = () => navigate('/');

  /* Lock background scroll while modal is open */
  useEffect(() => {
    const { body } = document;
    const prev = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => (body.style.overflow = prev);
  }, []);

  /* Form state */
  const [postcode, setPostcode] = useState('EC2A3AY');
  const [kwp, setKwp] = useState(4);
  const [tariff, setTariff] = useState('mock');

  /* Wizard navigation */
  const steps = [
    {
      label: 'Where is your home located?',
      content: (
        <label className="step-field">
          <span>Postcode</span>
          <input
            style={{ padding: '0.75rem 1rem', marginTop: '0.5rem' }}
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
          />
        </label>
      ),
      isValid: () => postcode.trim().length >= 5,
    },
    {
      label: 'How large is your solar array?',
      content: (
        <label className="step-field">
          <span>Array size (kWp)</span>
          <input
            type="number"
            step="0.1"
            min={0.5}
            style={{ padding: '0.75rem 1rem', marginTop: '0.5rem', width: '10rem' }}
            value={kwp}
            onChange={(e) => setKwp(Number(e.target.value))}
          />
        </label>
      ),
      isValid: () => kwp > 0,
    },
    {
      label: 'Which tariff do you use?',
      content: (
        <label className="step-field">
          <span>Tariff</span>
          <select
            style={{ padding: '0.75rem 1rem', marginTop: '0.5rem', width: '10rem' }}
            value={tariff}
            onChange={(e) => setTariff(e.target.value)}
          >
            <option value="mock">Mock</option>
            <option value="agile">Agile</option>
          </select>
        </label>
      ),
      isValid: () => !!tariff,
    },
  ];
  const [step, setStep] = useState(0);

  /* API & results */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generation, setGeneration] = useState(null);
  const [savings, setSavings] = useState(null);

  const runSimulation = useCallback(async () => {
    setLoading(true);
    setError('');
    setGeneration(null);
    setSavings(null);
    try {
      const base = 'http://localhost:5000';
      const qs = `?postcode=${encodeURIComponent(postcode)}&kwp=${kwp}&tariff=${tariff}`;
      const [genRes, saveRes] = await Promise.all([
        fetch(`${base}/simulate${qs}`),
        fetch(`${base}/dispatch${qs}`),
      ]);
      if (!genRes.ok || !saveRes.ok) throw new Error('API error');
      const genData = await genRes.json();
      const saveData = await saveRes.json();
      setGeneration(genData.daily_kwh);
      setSavings(saveData.money_saved);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [postcode, kwp, tariff]);

  /* Run when all steps complete */
  useEffect(() => {
    if (step === steps.length) runSimulation();
  }, [step, runSimulation, steps.length]);

  /* UI controls */
  const nextDisabled = !steps[step]?.isValid();
  const handleNext = () => {
    if (step < steps.length && !nextDisabled) setStep((s) => s + 1);
  };

  return (
    <div className="tool-overlay" onClick={closeModal}>
      <div
        className="tool-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ─── Header ─── */}
        <header className="tool-header">
          <SunIcon />
          <h1>Solar Savings Calculator</h1>
          <p>Demo only : )</p>
        </header>
  
        {/* ─── Progress bar ─── */}
        <div className="progress-wrapper">
          <div
            className="progress-bar"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>
  
        {/* ─── Wizard or Results ─── */}
        <AnimatePresence mode="wait">
          {step < steps.length ? (
            /* ── Wizard step ── */
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.25 }}
              className="wizard-step"
            >
              <h2 className="step-heading">{steps[step].label}</h2>
              {steps[step].content}
              <button
                className="next-btn"
                onClick={handleNext}
                disabled={nextDisabled}
              >
                {step === steps.length - 1 ? 'Calculate' : 'Next'}
              </button>
            </motion.div>
          ) : (
            /* ── Results ── */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="results-section"
            >
              {loading && <p>Calculating…</p>}
              {error && <p className="error">{error}</p>}
              {!loading && !error && (
                <>
                  <div className="result-card">
                    <h3>Estimated Daily Generation</h3>
                    <p className="result-value">
                      {generation?.toFixed(2)}&nbsp;kWh
                    </p>
                  </div>
                  <div className="result-card">
                    <h3>Potential 24-hour Savings</h3>
                    <p className="result-value">
                      £{savings?.toFixed(2)}
                    </p>
                  </div>
                  <button className="restart-btn" onClick={() => setStep(0)}>
                    Start Over
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
  
        {/* ─── Info boxes (always visible) ─── */}
        <section className="info-panel">
          <div className="info-box">
            <p>
              This tool estimates the potential savings from a home solar and
              battery system.
            </p>
            <ul>
              <li>
                <strong>Simulate Generation:</strong> Estimates the daily
                electricity generation (in kWh) for a given location and solar
                panel size.
              </li>
              <li>
                <strong>Dispatch:</strong> Simulates how a battery would be
                charged and discharged over the next 24&nbsp;hours to maximize
                savings, based on forecast generation and electricity prices. The
                result shows the estimated money saved.
              </li>
            </ul>
          </div>
  
          <div className="info-box">
            <h2>How it Works</h2>
            <p>
              The simulation uses historical solar data from the
              PVGIS-SARAH3&nbsp;database (up to 2023) to forecast generation for
              the next&nbsp;24&nbsp;hours. The dispatch algorithm then runs a
              greedy, one-pass simulation to determine the optimal battery
              charging and discharging schedule based on a mock electricity
              tariff.
            </p>
            <p>Assumptions:</p>
            <ul>
              <li>
                <strong>No household consumption:</strong> The model assumes all
                generated electricity is available for the battery or export.
              </li>
              <li>
                <strong>Fixed battery parameters:</strong> The simulation uses a
                fixed battery capacity (5&nbsp;kWh), power (3&nbsp;kW), and
                round-trip efficiency (92%).
              </li>
              <li>
                <strong>Mock electricity prices:</strong> The tariff is a simple
                three-tier mock tariff, not a real-time dynamic tariff.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}  