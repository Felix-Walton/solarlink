import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './Tool.css';

/* ─────── Sun icon ─────── */
const SunIcon = ({ size = 56 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className="text-yellow-400"
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

/* ─────── Sequential PV Savings Tool ─────── */
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
  const [postcode, setPostcode] = useState('EC2A 3AY');
  const [kwp, setKwp]           = useState(4);
  const [capKwh, setCapKwh]     = useState(5);
  const [powKw,  setPowKw]      = useState(3);
  const [eta,    setEta]        = useState(0.92);

  /* ─── Wizard steps ─── */
  const steps = [
    {
      label: 'Where is your home located?',
      hint:  'Enter your full UK postcode.',
      content: (
        <label className="step-field">
          <span>Postcode:</span>
          <input
            className="input-field"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
          />
        </label>
      ),
      isValid: () => postcode.trim().length >= 5,
    },
    {
      label: 'How large is your solar array?',
      hint:  'A typical home has 4–6 kWp.',
      content: (
        <label className="step-field">
          <span>Array size (kWp):</span>
          <input
            type="number"
            step="0.1"
            min={0.5}
            className="input-field w-40"
            value={kwp}
            onChange={(e) => setKwp(Number(e.target.value))}
          />
        </label>
      ),
      isValid: () => kwp > 0,
    },
    {
      label: 'Tell us about your battery',
      hint:  "Leave defaults if you're unsure.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="step-field">
            <span>Capacity (kWh)</span>
            <input
              type="number"
              step="0.1"
              min={0.5}
              className="input-field w-full"
              value={capKwh}
              onChange={(e) => setCapKwh(Number(e.target.value))}
            />
          </label>
          <label className="step-field">
            <span>Max power (kW)</span>
            <input
              type="number"
              step="0.1"
              min={0.5}
              className="input-field w-full"
              value={powKw}
              onChange={(e) => setPowKw(Number(e.target.value))}
            />
          </label>
          <label className="step-field">
            <span>Efficiency (0–1)</span>
            <input
              type="number"
              step="0.01"
              min={0.5}
              max={1}
              className="input-field w-full"
              value={eta}
              onChange={(e) => setEta(Number(e.target.value))}
            />
          </label>
        </div>
      ),
      isValid: () => capKwh > 0 && powKw > 0 && eta >= 0.5 && eta <= 1,
    },
  ];
  const [step, setStep] = useState(0);

  /* ─── API & results state ─── */
  const [loading,       setLoading]     = useState(false);
  const [error,         setError]       = useState('');
  const [fallback,      setFallback]    = useState(false);
  const [generation,    setGeneration]  = useState(null);
  const [moneySaved,    setMoneySaved]  = useState(null);
  const [baselineCost, setBaselineCost] = useState(null);
  const [withBattCost, setWithBattCost] = useState(null);
  const [kwhShifted,    setKwhShifted]  = useState(null);
  const [showDetails,   setShowDetails] = useState(false);

  /* ─── Fetch simulation ─── */
  const runSimulation = useCallback(async () => {
    setLoading(true);
    setError('');
    setFallback(false);
    setShowDetails(false);

    try {
      const base = 'http://localhost:5000';
      const qs =
        `?postcode=${encodeURIComponent(postcode)}` +
        `&kwp=${kwp}` +
        `&cap_kwh=${capKwh}` +
        `&pow_kw=${powKw}` +
        `&eta=${eta}`;

      const [genRes, saveRes] = await Promise.all([
        fetch(`${base}/simulate${qs}`),
        fetch(`${base}/dispatch${qs}`),
      ]);
      if (!genRes.ok || !saveRes.ok) throw new Error('API error');

      const genData  = await genRes.json();
      const saveData = await saveRes.json();

      setGeneration(genData.daily_kwh);
      setMoneySaved(saveData.money_saved);
      setBaselineCost(saveData.baseline_cost);
      setWithBattCost(saveData.with_batt_cost);
      setKwhShifted(saveData.kwh_shifted);
      setFallback(Boolean(saveData.fallback));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [postcode, kwp, capKwh, powKw, eta]);

  /* Run once all steps completed */
  useEffect(() => {
    if (step === steps.length) runSimulation();
  }, [step, runSimulation, steps.length]);

  /* ─── Helpers ─── */
  const nextDisabled = !steps[step]?.isValid();
  const handleNext   = () => { if (!nextDisabled) setStep(s => s + 1); };



  /* ─────────── UI ─────────── */
  return (
    <div className="tool-overlay" onClick={closeModal}>
      <div className="tool-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="tool-header">
          <SunIcon />
          <h1 className="text-2xl font-bold">Solar Savings Calculator</h1>
          <p className="text-gray-500">Demo only :)</p>
        </header>

        {/* Progress bar */}
        <div className="progress-wrapper">
          <div
            className="progress-bar"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>

        {/* Fallback banner */}
        {fallback && (
          <div className="bg-yellow-100 text-yellow-900 p-3 text-center text-sm">
            Live Agile prices not yet published – using mock tariff.
            <span className="ml-1 italic">(try again after&nbsp;16:00&nbsp;UK)</span>
          </div>
        )}

        {/* Wizard or Results */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {step < steps.length ? (
              /* Wizard step */
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="step-heading">{steps[step].label}</h2>
                <div className="mt-6">{steps[step].content}</div>
                <div className="bg-gray-100 p-3 rounded-md mt-4 text-sm text-gray-700">
                  {steps[step].hint}
                </div>
                <button
                  className="next-btn"
                  onClick={handleNext}
                  disabled={nextDisabled}
                >
                  {step === steps.length - 1 ? 'Calculate' : 'Next'}
                </button>
              </motion.div>
            ) : (
              /* Results */
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {loading && <p className="text-center">Calculating…</p>}
                {error && <p className="error-message">Error: {error}</p>}

                {!loading && !error && (
                  <>
                    <div className="result-grid">
                      <ResultCard title="Est. Daily Generation" value={`${generation?.toFixed(2)} kWh`} />
                      <ResultCard title="Potential 24-hour Savings" value={`£${moneySaved?.toFixed(2)}`} />
                    </div>

                    {/* Details drawer */}
                    <div className="mt-6 text-center">
                      <button className="details-btn" onClick={() => setShowDetails(d => !d)}>
                        {showDetails ? 'Hide' : 'Show'} details
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showDetails ? 'rotate(180deg)' : 'none' }}>
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    </div>

                    {showDetails && (
                      <div className="details-panel">
                        <DetailRow label="Baseline (no battery)" value={baselineCost} isMoney />
                        <DetailRow label="With battery"            value={withBattCost} isMoney />
                        {/* NEW — extra cash thanks to the battery */}
                        <DetailRow
                          label="Extra thanks to battery"
                          value={moneySaved}
                          isMoney
                        />
                        <DetailRow
                          label="Energy shifted"
                          value={`${kwhShifted?.toFixed(1)} kWh`}
                        />
                      </div>
                    )}

                    <div className="text-center mt-8">
                      <button className="next-btn" onClick={() => setStep(0)}>
                        Start Over
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info boxes */}
        <section className="info-panel">
          <div className="info-box">
            <p className="font-semibold">How this tool works</p>
            <ul className="list-disc list-inside mt-2 text-sm">
              <li>
                <strong>Generation:</strong> forecasts PV output for the next 24 h based on your location and array size.
              </li>
              <li>
                <strong>Dispatch:</strong> runs your battery against tomorrow’s Agile prices <em>after deducting a fixed 0.6 kWh household load from 17:00-22:00</em>.
              </li>
            </ul>
          </div>

          <div className="info-box">
            <h2 className="font-semibold">Default assumptions</h2>
            <ul className="list-disc list-inside mt-2 text-sm">
              <li>Falls back to a tiered mock tariff if live data is unavailable.</li>
              <li>Battery defaults pre-filled above – edit to match your system.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

const formatMoney = (v) =>
  v === null || v === undefined
    ? ''
    : `£${Math.abs(v).toFixed(2)} ${v < 0 ? 'earned' : 'cost'}`;

/* ── Small sub-components ── */
const ResultCard = ({ title, value }) => (
  <div className="result-card">
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="result-value">{value}</p>
  </div>
);

const DetailRow = ({ label, value, isMoney }) => (
  <div className="flex justify-between text-sm py-1">
    <span>{label}</span>
    <span className="font-medium">
      {isMoney ? formatMoney(value) : value}
    </span>
  </div>
);