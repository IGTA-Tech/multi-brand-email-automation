export default function Home() {
  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        📧 Multi-Brand Email Automation System
      </h1>
      
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
        AI-powered email campaigns with intelligent frequency controls
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>🎨 Streamlit Dashboard</h2>
          <p>Interactive dashboard for campaign management and analytics</p>
          <a href="https://YOUR_APP.streamlit.app" style={{ color: '#0066cc' }}>View Dashboard →</a>
        </div>

        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>⚡ n8n Workflows</h2>
          <p>6 automated workflows for email processing and AI generation</p>
          <a href="/docs/04-N8N-WORKFLOWS.md" style={{ color: '#0066cc' }}>Documentation →</a>
        </div>

        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>📚 Documentation</h2>
          <p>Complete system documentation (100+ pages)</p>
          <a href="https://github.com/IGTA-Tech/multi-brand-email-automation/tree/master/docs" style={{ color: '#0066cc' }}>View Docs →</a>
        </div>
      </div>

      <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2>✨ System Features</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>✅ Multi-brand management with unique voice guidelines</li>
          <li>✅ Claude AI-powered email personalization</li>
          <li>✅ Smart frequency controls (24h/7d/30d limits)</li>
          <li>✅ Comprehensive tracking (opens, clicks, engagement)</li>
          <li>✅ Auto-pilot mode for automated follow-ups</li>
          <li>✅ Real-time analytics and reporting</li>
        </ul>
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center', color: '#999' }}>
        <p>Built with Claude AI, n8n, Google Sheets, Airtable, and Streamlit</p>
        <p style={{ marginTop: '0.5rem' }}>
          <a href="https://github.com/IGTA-Tech/multi-brand-email-automation" style={{ color: '#0066cc' }}>
            View on GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
