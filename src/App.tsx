import { useMatchmakingDemo } from './hooks/useMatchmakingDemo';
import { FounderDevice } from './components/founder/FounderDevice';
import { InvestorDevice } from './components/investor/InvestorDevice';

export default function App() {
  const hook = useMatchmakingDemo();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        padding: '48px 28px 64px',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: hook.error ? '#b42318' : 'var(--color-neutral-600)',
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: hook.error ? '#d92d20' : hook.loading ? '#e0a42d' : '#32a56b' }} />
        {hook.error ? `API error: ${hook.error}` : hook.loading ? 'Matching…' : `Backend connected · ${hook.apiMode}`}
      </div>

      <button
        className="btn btn-icon"
        aria-label="Reset demo"
        onClick={hook.reset}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          color: 'var(--color-neutral-600)',
          borderColor: 'var(--color-neutral-300)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor">
          <path d="M197.67 186.37a8 8 0 0 1 0 11.29C179.4 216 155 224 128 224c-36.9 0-68.2-19.2-85.3-48.4l-9 15.6a8 8 0 1 1-13.86-8l20-34.64a8 8 0 0 1 10.93-2.93l34.64 20a8 8 0 1 1-8 13.86l-19.5-11.26C71.2 191.5 97.2 208 128 208c22.7 0 42.9-6.6 58-21.6a8 8 0 0 1 11.67-.03ZM128 32c-27 0-51.4 8-69.67 26.34a8 8 0 0 0 11.34 11.29C84.8 54.6 105.3 48 128 48c30.8 0 56.8 16.5 70.09 39.77L178.59 76.5a8 8 0 0 0-8 13.86l34.64 20a8 8 0 0 0 10.93-2.93l20-34.64a8 8 0 1 0-13.86-8l-9 15.6C196.2 51.2 164.9 32 128 32Z" />
        </svg>
      </button>

      <div style={{ display: 'flex', gap: 110, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
          <h2 style={{ margin: 0, color: 'var(--color-neutral-900)', fontSize: 34 }}>Founder</h2>
          <div style={{ border: '4px solid #0c0d14', borderRadius: 52, display: 'flex' }}>
            <FounderDevice hook={hook} now={hook.now} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
          <h2 style={{ margin: 0, color: 'var(--color-neutral-900)', fontSize: 34 }}>Investor</h2>
          <div style={{ border: '4px solid #0c0d14', borderRadius: 52, display: 'flex' }}>
            <InvestorDevice hook={hook} now={hook.now} />
          </div>
        </div>
      </div>
    </div>
  );
}
