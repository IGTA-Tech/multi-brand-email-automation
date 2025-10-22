# Deployment Guide - Multi-Brand Email Automation System

## Overview

This guide walks you through deploying the complete Multi-Brand Email Automation System from scratch to production.

**Estimated Time**: 4-6 hours
**Difficulty**: Intermediate
**Prerequisites**: Basic knowledge of Google Workspace, Airtable, n8n, and command line

---

## Phase 1: Pre-Deployment Checklist

### Required Accounts & Services

- [ ] Google Workspace account (Business Standard or higher)
- [ ] Airtable account (Pro tier recommended)
- [ ] Anthropic API key (Claude access)
- [ ] Lido account (Pro tier)
- [ ] DigitalOcean account (for n8n hosting) OR n8n Cloud subscription
- [ ] Domain name for tracking (optional but recommended)
- [ ] Slack workspace (optional, for notifications)

### Required Information to Gather

- [ ] Brand email addresses for each brand
- [ ] Brand voice guidelines and signatures
- [ ] List of initial contacts to import
- [ ] Existing email templates (if any)
- [ ] Frequency limit preferences

---

## Phase 2: Google Workspace Setup

### Step 1: Configure Gmail Accounts

For each brand:

```
1. Create/verify Gmail account (e.g., contact@sherrodsportsvisas.com)
2. Enable IMAP/SMTP access
3. Generate App Password (for API access)
4. Configure signature
5. Set up labels/filters
```

### Step 2: Configure Email Authentication

**SPF Record**:
```dns
v=spf1 include:_spf.google.com ~all
```

**DKIM Setup**:
```
1. Google Admin → Apps → Google Workspace → Gmail
2. Authenticate email → Generate new record
3. Add TXT record to DNS:
   google._domainkey.yourdomain.com
4. Verify after 24-48 hours
```

**DMARC Policy**:
```dns
_dmarc.yourdomain.com
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

### Step 3: Create Google Sheets Workbook

```
1. Go to sheets.google.com
2. Create new spreadsheet: "Multi-Brand Email Automation - Master Data"
3. Create 5 sheets (see schema documentation):
   - Ultimate Contact Sheet
   - Send History Log
   - Brand Configuration
   - Template Library
   - Campaign Queue
4. Add column headers as per schema
5. Apply data validation rules
6. Set up formulas for auto-calculations
```

### Step 4: Set Up Google Cloud Project

```
1. Go to console.cloud.google.com
2. Create new project: "email-automation"
3. Enable APIs:
   - Google Sheets API
   - Gmail API
   - Google Drive API
4. Create service account:
   - Name: n8n-automation
   - Role: Editor
5. Generate JSON key
6. Share Google Sheets with service account email
```

---

## Phase 3: Airtable Setup

### Step 1: Create Base

```
1. Go to airtable.com
2. Create new base: "Multi-Brand Email Automation"
3. Create 5 tables (see schema documentation):
   - Contacts
   - Campaigns
   - Campaign Queue
   - Brands
   - Templates
4. Configure fields, relationships, and formulas
5. Create views as specified
6. Set up automations
```

### Step 2: Generate API Credentials

```
1. Go to airtable.com/account
2. Generate personal access token
3. Scopes: data.records:read, data.records:write
4. Name: n8n-email-automation
5. Copy token (save securely)
6. Get Base ID from URL
7. Get Table IDs from API documentation
```

---

## Phase 4: n8n Deployment

### Option A: Self-Hosted (DigitalOcean)

#### Step 1: Create Droplet

```bash
# Create Ubuntu 22.04 droplet (minimum 2GB RAM, 4GB recommended)
# Choose datacenter region closest to your users

# SSH into droplet
ssh root@your-droplet-ip
```

#### Step 2: Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install n8n
npm install -g n8n

# Install PostgreSQL (for n8n database)
apt install -y postgresql postgresql-contrib

# Create n8n database
sudo -u postgres createdb n8n
sudo -u postgres createuser n8n
sudo -u postgres psql -c "ALTER USER n8n WITH PASSWORD 'your-secure-password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE n8n TO n8n;"
```

#### Step 3: Configure n8n

```bash
# Create n8n directory
mkdir -p /root/.n8n

# Create environment file
cat > /root/.n8n/.env << EOF
# n8n Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-secure-password
N8N_HOST=your-domain.com
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://your-domain.com/

# Database
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=your-secure-password

# Execution
EXECUTIONS_PROCESS=main
EXECUTIONS_MODE=queue
N8N_PAYLOAD_SIZE_MAX=16

# Timezone
GENERIC_TIMEZONE=America/New_York
EOF
```

#### Step 4: Start n8n with PM2

```bash
# Start n8n
pm2 start n8n -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

#### Step 5: Configure Nginx Reverse Proxy

```bash
# Install Nginx
apt install -y nginx

# Create n8n configuration
cat > /etc/nginx/sites-available/n8n << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t
systemctl reload nginx
```

#### Step 6: Install SSL Certificate

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d your-domain.com

# Auto-renewal is configured by default
```

### Option B: n8n Cloud

```
1. Go to n8n.cloud
2. Sign up for account
3. Choose plan (Starter or Pro)
4. Create new instance
5. Note your instance URL
6. Configure webhook URL in settings
```

---

## Phase 5: Import Workflows

### Step 1: Import Workflow Files

```
1. Log into n8n (https://your-domain.com)
2. Navigate to Workflows
3. For each workflow JSON file in /n8n-workflows:
   - Click "Import from File"
   - Select workflow JSON
   - Click "Import"
4. Repeat for all 6 workflows
```

### Step 2: Configure Credentials

**Google OAuth2**:
```
1. Credentials → Add Credential → Google OAuth2 API
2. Follow OAuth flow
3. Grant permissions: Sheets, Gmail
4. Test connection
```

**Airtable Personal Access Token**:
```
1. Credentials → Add Credential → Airtable Personal Access Token
2. Paste your token
3. Test connection
```

**Anthropic API (HTTP Header)**:
```
1. Credentials → Add Credential → Header Auth
2. Name: x-api-key
3. Value: your-anthropic-api-key
```

### Step 3: Update Workflow Variables

For each workflow, update:

- Google Spreadsheet IDs
- Airtable Base ID and Table names
- Webhook URLs
- Tracking domain
- Brand configurations

### Step 4: Test Workflows

Test each workflow individually:

```
WF1 - Data Sync:
  1. Add test contact to Google Sheets
  2. Click "Execute Workflow"
  3. Verify data appears in Airtable
  4. Check execution log

WF2 - Campaign Init:
  1. Send test webhook (use Postman or curl)
  2. Verify queue entry created
  3. Check message generation

WF3 - Execute Queue:
  1. Create test queue entry
  2. Execute workflow
  3. Verify Lido sheet updated

WF4 - Track Opens:
  1. Send test tracking event
  2. Verify metrics updated

WF5 - Claude Generation:
  1. Test with sample contact
  2. Verify email generated correctly

WF6 - Auto-Pilot:
  1. Set up qualifying test contacts
  2. Execute manually
  3. Verify campaigns created
```

### Step 5: Enable Production Workflows

```
1. For CRON workflows (WF1, WF3, WF6):
   - Set to "Active"
   - Verify schedule is correct

2. For webhook workflows (WF2, WF4, WF5):
   - Copy production webhook URLs
   - Configure authentication
   - Update calling systems
```

---

## Phase 6: Lido Setup

### Step 1: Create Lido Spreadsheet

```
1. Go to lido.app
2. Create new spreadsheet
3. Name: "Email Automation - Send Queue"
4. Add columns:
   - Queue ID
   - Campaign ID
   - To Email
   - To Name
   - From Email
   - From Name
   - Reply-To
   - Subject
   - Body HTML
   - Tracking Pixel
   - Status
   - Scheduled For
   - Sent At
   - Opened
   - Opened At
   - Clicked
   - Clicked At
   - Error Message
```

### Step 2: Configure Lido Automation

```
1. Lido → Automations → New Automation
2. Trigger: "When row is added"
3. Action 1: Send Email
   - To: {{To Email}}
   - From: {{From Email}}
   - From Name: {{From Name}}
   - Reply-To: {{Reply-To}}
   - Subject: {{Subject}}
   - Body: {{Body HTML}}
4. Action 2: Update Row
   - Status: "Sent"
   - Sent At: NOW()
5. Action 3: Call Webhook
   - URL: n8n webhook for send confirmation
   - Method: POST
   - Body: { "queueId": "{{Queue ID}}", "status": "sent", "sentAt": "{{Sent At}}" }
6. Save automation
```

### Step 3: Configure Email Tracking

```
1. Lido → Settings → Tracking
2. Enable open tracking
3. Enable click tracking
4. Configure webhook callbacks:
   - Open event: POST to n8n WF4 webhook
   - Click event: POST to n8n WF4 webhook
5. Test tracking with sample email
```

---

## Phase 7: Data Import

### Step 1: Prepare Contact Data

```
1. Export existing contacts to CSV
2. Format columns to match schema:
   - Contact ID (generate if needed)
   - First Name, Last Name, Email (required)
   - Lead Status, Lead Score
   - Visa Type (if applicable)
   - All other fields
3. Clean data:
   - Remove duplicates
   - Validate email format
   - Fill required fields
```

### Step 2: Import to Google Sheets

```
1. Open Ultimate Contact Sheet
2. File → Import → Upload CSV
3. Replace data or append rows
4. Verify formulas still work
5. Run data validation
```

### Step 3: Trigger Initial Sync

```
1. Manually trigger WF1 (Data Sync)
2. Wait for completion
3. Verify all contacts in Airtable
4. Check for errors in logs
```

### Step 4: Import Brand Configuration

```
1. Add brands to Brand Configuration sheet
2. Include all required fields:
   - Brand ID, Name, Email
   - Voice guidelines
   - Signature
   - Sending limits
3. Verify brand records created
```

### Step 5: Import Templates

```
1. Add templates to Template Library sheet
2. Include variables in double curly braces: {{firstName}}
3. Test template rendering
4. Verify templates in Airtable
```

---

## Phase 8: Testing & Validation

### Test Campaign End-to-End

```
1. Create test campaign via WF2 webhook:
   curl -X POST https://your-n8n.com/webhook/campaign-init \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer your-key" \
   -d '{
     "campaignName": "Test Campaign",
     "brandId": "sherrod-sports-visas",
     "contactIds": ["TEST-001"],
     "messageMode": "claude_ai",
     "deliveryMode": "immediate",
     "campaignType": "test"
   }'

2. Monitor workflow execution
3. Verify queue entry created
4. Wait for WF3 to process (max 5 min)
5. Check Lido sheet for email entry
6. Verify email sent
7. Test tracking pixel (open email)
8. Verify metrics updated
```

### Test Frequency Validation

```
1. Create contact with emails already sent today
2. Try to send campaign to that contact
3. Verify contact is blocked
4. Check error message in queue
```

### Test Auto-Pilot

```
1. Create contacts meeting auto-pilot criteria:
   - Lead Status: Hot
   - Lead Score: 8+
   - Days Since Contact: 7-30
   - Engagement Score: 40+
2. Manually trigger WF6
3. Verify campaigns created automatically
4. Check frequency limits respected
```

---

## Phase 9: Monitoring Setup

### Configure Logging

```
1. n8n → Settings → Log Streaming
2. Enable execution logs
3. Set log level: info
4. Configure log retention: 30 days
```

### Set Up Alerts

**Slack Integration**:
```
1. Create Slack webhook URL
2. Add to n8n credentials
3. Configure error handlers to post to Slack
4. Test with intentional error
```

**Email Alerts**:
```
1. Configure SMTP credentials in n8n
2. Add email notification nodes to error handlers
3. Test alerts
```

### Create Monitoring Dashboard

```
1. Use Airtable interfaces or
2. Build custom dashboard (see UI docs)
3. Display key metrics:
   - Emails sent today
   - Open/click rates
   - Active campaigns
   - Blocked contacts
   - System health
```

---

## Phase 10: Production Launch

### Pre-Launch Checklist

- [ ] All workflows tested and active
- [ ] Credentials verified and secure
- [ ] Brand configurations complete
- [ ] Contacts imported and synced
- [ ] Templates created and tested
- [ ] Frequency rules configured
- [ ] Tracking working correctly
- [ ] Monitoring and alerts active
- [ ] Backups configured
- [ ] Team trained on system
- [ ] Documentation accessible

### Gradual Rollout Plan

**Week 1: Pilot**
```
- Single brand
- 50-100 contacts
- Manual campaign creation
- Daily monitoring
- Collect feedback
```

**Week 2-3: Expansion**
```
- Add 2nd brand
- 500-1000 contacts
- Enable auto-pilot for qualified leads
- Continue monitoring
```

**Week 4+: Full Production**
```
- All brands active
- Full contact list
- All automation enabled
- Weekly performance reviews
```

---

## Phase 11: Backup & Disaster Recovery

### Automated Backups

**Google Sheets**:
```
1. File → Make a copy → Schedule daily
2. Save to specific Drive folder
3. Name with timestamp
```

**Airtable**:
```
1. Create n8n workflow for daily backup
2. Use Airtable API to export all tables
3. Save to Google Drive or S3
```

**n8n Workflows**:
```
1. Regularly export all workflows
2. Save to Git repository
3. Version control all changes
```

### Recovery Procedures

**If n8n Goes Down**:
```
1. Check server status
2. Restart PM2: pm2 restart n8n
3. Check logs: pm2 logs n8n
4. Restore from backup if needed
```

**If Data Sync Fails**:
```
1. Check last successful sync time
2. Review error logs
3. Manually trigger sync
4. Verify data consistency
5. Re-run sync if needed
```

---

## Phase 12: Optimization

### Performance Tuning

**After 1 Month**:
```
1. Analyze workflow execution times
2. Identify bottlenecks
3. Optimize slow queries
4. Add caching where beneficial
5. Review and adjust batch sizes
```

### Cost Optimization

**Review Monthly Costs**:
```
1. Claude API usage
2. n8n execution time
3. Google/Airtable API calls
4. Server resources
```

**Optimization Strategies**:
```
1. Cache frequently accessed data
2. Reduce API calls with batching
3. Optimize Claude prompts for token efficiency
4. Use template fallbacks to reduce AI costs
```

---

## Troubleshooting

### Common Issues

**Workflow Not Triggering**:
```
1. Check workflow is Active
2. Verify CRON schedule
3. Check timezone settings
4. Review execution history
```

**Data Sync Issues**:
```
1. Verify credentials valid
2. Check API rate limits
3. Review filter formulas
4. Inspect error logs
```

**Emails Not Sending**:
```
1. Check Lido automation active
2. Verify Gmail credentials
3. Check daily/hourly limits
4. Review queue status
```

**Tracking Not Working**:
```
1. Verify tracking pixel inserted
2. Check webhook URLs correct
3. Test with known-good email
4. Review Lido tracking config
```

---

## Support & Maintenance

### Weekly Tasks
- [ ] Review error logs
- [ ] Check campaign performance
- [ ] Verify data sync status
- [ ] Monitor API quotas

### Monthly Tasks
- [ ] Review and optimize workflows
- [ ] Update brand configurations
- [ ] Audit contact data quality
- [ ] Analyze engagement trends
- [ ] Update templates based on performance

### Quarterly Tasks
- [ ] Security audit
- [ ] Credential rotation
- [ ] System performance review
- [ ] Cost analysis and optimization
- [ ] Feature roadmap review

---

## Success Metrics

Track these KPIs:

- **System Health**: Uptime %, error rate
- **Delivery**: Delivery rate, bounce rate
- **Engagement**: Open rate, click rate, reply rate
- **Efficiency**: Emails per hour, cost per email
- **Compliance**: Frequency violations, opt-outs

---

**Document Version**: 1.0
**Last Updated**: 2025-10-22
**Deployment Difficulty**: Intermediate
**Estimated Total Time**: 4-6 hours
