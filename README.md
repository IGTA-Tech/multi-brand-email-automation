# Multi-Brand Email Automation System

A comprehensive, AI-powered email automation platform for managing campaigns across multiple brands with intelligent personalization, frequency controls, and advanced analytics.

## 🌟 Features

- **Multi-Brand Support**: Manage unlimited brands with unique voice, signature, and configurations
- **AI-Powered Personalization**: Claude AI generates contextual, personalized emails
- **Smart Frequency Controls**: Prevents email fatigue with intelligent rate limiting
- **Comprehensive Tracking**: Real-time open, click, and engagement tracking
- **Auto-Pilot Mode**: AI-driven automatic follow-up campaigns
- **Campaign Management**: Flexible campaign creation with multiple delivery modes
- **Analytics Dashboard**: Deep insights into campaign performance and contact engagement

## 🏗️ Architecture

The system is built on a 5-layer architecture:

1. **Data Storage Layer**: Google Sheets (master) + Airtable (relational)
2. **Workflow Automation Layer**: n8n with 6 core workflows
3. **AI Intelligence Layer**: Claude API for email generation
4. **Email Delivery Layer**: Lido with Gmail API integration
5. **Validation & Controls Layer**: Frequency management and compliance

## 📋 Prerequisites

- **Google Workspace** account (Business Standard or higher)
- **Airtable** account (Pro tier recommended)
- **n8n** instance (self-hosted or cloud)
- **Lido** account (Pro tier)
- **Anthropic API** key (Claude access)
- **Node.js** 18+ (for UI and scripts)
- **Docker** (optional, for Redis and monitoring)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd multi-brand-email-automation
npm install
```

### 2. Configure Environment

```bash
cp config/.env.example config/.env
# Edit config/.env with your credentials
```

### 3. Set Up Data Storage

```bash
# Follow the guides in /docs to set up:
# - Google Sheets (5 sheets)
# - Airtable Base (5 tables)
```

### 4. Deploy n8n Workflows

```bash
# Import workflows from /n8n-workflows
# Configure credentials in n8n
```

### 5. Launch UI (Optional)

```bash
npm run dev
# Access at http://localhost:3000
```

## 📁 Project Structure

```
multi-brand-email-automation/
├── config/                   # Configuration files
│   ├── .env.example
│   ├── brands.json
│   └── frequency-rules.json
├── deployment/               # Deployment scripts and configs
│   ├── docker-compose.yml
│   ├── n8n-setup.sh
│   └── nginx.conf
├── docs/                     # Comprehensive documentation
│   ├── 01-ARCHITECTURE-REVIEW.md
│   ├── 02-GOOGLE-SHEETS-SCHEMA.md
│   ├── 03-AIRTABLE-SCHEMA.md
│   ├── 04-N8N-WORKFLOWS.md
│   ├── 05-CLAUDE-INTEGRATION.md
│   ├── 06-LIDO-SETUP.md
│   ├── 07-DEPLOYMENT-GUIDE.md
│   └── 08-USER-MANUAL.md
├── n8n-workflows/            # n8n workflow JSON exports
│   ├── 01-data-sync.json
│   ├── 02-campaign-init.json
│   ├── 03-execute-queue.json
│   ├── 04-track-opens.json
│   ├── 05-claude-generation.json
│   └── 06-auto-pilot.json
├── schemas/                  # Database schemas
│   ├── google-sheets/
│   └── airtable/
├── scripts/                  # Utility scripts
│   ├── frequency-validator.js
│   ├── data-sync-checker.js
│   ├── campaign-analyzer.js
│   └── bulk-import.js
├── tests/                    # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── ui/                       # Campaign management UI
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

```env
# Google APIs
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_SPREADSHEET_ID=your_sheet_id

# Airtable
AIRTABLE_API_KEY=your_api_key
AIRTABLE_BASE_ID=your_base_id

# Anthropic Claude
ANTHROPIC_API_KEY=your_anthropic_key

# n8n
N8N_HOST=your_n8n_host
N8N_API_KEY=your_n8n_api_key

# Lido
LIDO_SPREADSHEET_ID=your_lido_sheet_id

# Optional: Redis, Monitoring
REDIS_URL=redis://localhost:6379
SENTRY_DSN=your_sentry_dsn
```

### Brand Configuration

Edit `config/brands.json` to add your brands:

```json
{
  "brands": [
    {
      "id": "brand-1",
      "name": "Sherrod Sports Visas",
      "email": "contact@sherrodsportsvisas.com",
      "replyTo": "support@sherrodsportsvisas.com",
      "voiceGuidelines": "Professional, authoritative, sports-focused",
      "signature": "Best regards,\nSherrod Sports Visas Team",
      "dailyLimit": 500,
      "workspace": "workspace-1"
    }
  ]
}
```

## 📊 Data Schema

### Google Sheets Structure

1. **Ultimate Contact Sheet**: Master contact database
2. **Send History Log**: Complete email send history
3. **Brand Configuration**: Brand settings and metadata
4. **Template Library**: Reusable email templates
5. **Lido Send Queue**: Email delivery queue

### Airtable Structure

1. **Contacts**: Synced contact records with relationships
2. **Campaigns**: Campaign tracking and management
3. **Campaign Queue**: Active campaign queue
4. **Brands**: Brand metadata and settings
5. **Templates**: Template library with performance metrics

## 🔄 Workflows

### WF1: Data Sync (Hourly)
Syncs Google Sheets ↔ Airtable bidirectionally

### WF2: Campaign Initialization (Webhook)
Creates campaigns, validates contacts, queues emails

### WF3: Execute Queue (Every 5 min)
Processes queue, sends emails via Lido

### WF4: Track Opens/Clicks (Webhook)
Updates engagement metrics from tracking events

### WF5: Claude Generation (On-demand)
Generates personalized emails using Claude AI

### WF6: Auto-Pilot (Daily)
Automatically creates follow-up campaigns for engaged leads

## 🤖 AI Integration

The system uses Claude AI (Sonnet 4) for:

- Personalized email generation based on contact context
- Dynamic subject line optimization
- Tone adaptation based on lead status
- Brand voice consistency enforcement

## 📈 Analytics & Reporting

Track key metrics:

- **Campaign Performance**: Open rates, click rates, reply rates
- **Contact Engagement**: Engagement scores, interaction history
- **Brand Analytics**: Per-brand performance metrics
- **Deliverability**: Bounce rates, spam complaints

## 🛡️ Frequency Controls

Built-in safeguards prevent email fatigue:

- **Hard Limit**: Max 1 email per 24 hours (blocks send)
- **Warning Limit**: Max 3 emails per 7 days (warns user)
- **Soft Limit**: Max 10 emails per 30 days (tracked)
- **Engagement-Based**: Auto-adjust frequency based on engagement

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 🚢 Deployment

### Option 1: Self-Hosted (Recommended)

```bash
cd deployment
docker-compose up -d
```

### Option 2: Cloud Deployment

Follow the detailed guide in `docs/07-DEPLOYMENT-GUIDE.md`

## 📚 Documentation

- [Architecture Review](docs/01-ARCHITECTURE-REVIEW.md)
- [Google Sheets Schema](docs/02-GOOGLE-SHEETS-SCHEMA.md)
- [Airtable Schema](docs/03-AIRTABLE-SCHEMA.md)
- [n8n Workflows](docs/04-N8N-WORKFLOWS.md)
- [Claude Integration](docs/05-CLAUDE-INTEGRATION.md)
- [Lido Setup](docs/06-LIDO-SETUP.md)
- [Deployment Guide](docs/07-DEPLOYMENT-GUIDE.md)
- [User Manual](docs/08-USER-MANUAL.md)

## 🔒 Security

- All credentials stored in n8n secure credential storage
- API keys encrypted at rest
- Rate limiting on all external API calls
- Audit logging for all email sends
- GDPR/CAN-SPAM compliance built-in

## 💰 Cost Estimate

**Monthly Operating Cost**: $156-$306
- Google Workspace: $12/user
- Airtable Pro: $20/user
- n8n (DigitalOcean): $24
- Lido Pro: $50
- Claude API: $50-200 (usage-based)

## 🤝 Support

- **Documentation**: See `/docs` folder
- **Issues**: Open an issue on GitHub
- **Email**: support@yourdomain.com

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with n8n, Claude AI, Google Sheets, Airtable, and Lido
- Architecture inspired by modern email automation best practices

---

**Version**: 1.0.0
**Last Updated**: 2025-10-22
**Status**: Production Ready
