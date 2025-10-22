# n8n Workflows Documentation

## Overview

The Multi-Brand Email Automation System uses 6 core n8n workflows that handle data synchronization, campaign management, email delivery, tracking, AI generation, and automated follow-ups.

**n8n Version Required**: 1.0+
**Execution Mode**: Queue mode recommended for production
**Credentials Required**: Google OAuth2, Airtable API, Anthropic API, HTTP webhooks

---

## Workflow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     n8n Workflow Ecosystem                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  WF1: Data Sync (CRON: hourly)                             │
│  ├─→ Google Sheets → Airtable                              │
│  └─→ Airtable → Google Sheets                              │
│                                                              │
│  WF2: Campaign Init (Webhook: manual)                       │
│  ├─→ Load contacts                                          │
│  ├─→ Validate frequency                                     │
│  ├─→ Generate messages (calls WF5)                          │
│  └─→ Create queue entries                                   │
│                                                              │
│  WF3: Execute Queue (CRON: every 5 min)                     │
│  ├─→ Load ready queue entries                               │
│  ├─→ Re-validate frequency                                  │
│  ├─→ Write to Lido sheet                                    │
│  └─→ Update status                                          │
│                                                              │
│  WF4: Track Opens/Clicks (Webhook: from Lido)               │
│  ├─→ Receive tracking event                                 │
│  ├─→ Update Send History                                    │
│  ├─→ Update Contact metrics                                 │
│  └─→ Update Campaign stats                                  │
│                                                              │
│  WF5: Claude Generation (Called by WF2)                     │
│  ├─→ Load contact context                                   │
│  ├─→ Build prompt with brand voice                          │
│  ├─→ Call Claude API                                        │
│  └─→ Return personalized email                              │
│                                                              │
│  WF6: Auto-Pilot (CRON: daily 9am)                          │
│  ├─→ Find stale hot leads                                   │
│  ├─→ Check engagement scores                                │
│  ├─→ Generate follow-ups                                    │
│  └─→ Trigger WF2 for each                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## WF1: Data Sync (Google Sheets ↔ Airtable)

### Purpose
Bidirectional synchronization between Google Sheets (master) and Airtable (relational) every hour.

### Trigger
**Type**: Schedule (CRON)
**Schedule**: `0 * * * *` (every hour)
**Timezone**: America/New_York

### Workflow Steps

#### 1. CRON Trigger
- Executes workflow every hour

#### 2. Set Sync Timestamp
**Node Type**: Set
**Action**: Add timestamp variable
```javascript
{
  "syncStartTime": "{{$now.toISO()}}",
  "syncId": "SYNC-{{$now.toFormat('yyyyMMdd-HHmmss')}}"
}
```

#### 3. Google Sheets: Read Contacts
**Node Type**: Google Sheets
**Operation**: Read
**Sheet**: Ultimate Contact Sheet
**Range**: A2:AZ (all data rows)
**Output**: Array of contact objects

#### 4. Filter Updated Contacts
**Node Type**: Code
**Language**: JavaScript
```javascript
// Filter contacts modified since last sync
const lastSyncTime = $node["Get Last Sync Time"].json.lastSync;
const updatedContacts = items.filter(item => {
  const modifiedDate = new Date(item.json['Last Modified']);
  return modifiedDate > new Date(lastSyncTime);
});
return updatedContacts;
```

#### 5. Split Into Batches
**Node Type**: Split In Batches
**Batch Size**: 50
**Reset**: After all items processed

#### 6. Airtable: Check Contact Exists
**Node Type**: Airtable
**Operation**: List
**Base**: Multi-Brand Email Automation
**Table**: Contacts
**Filter**: `{Contact ID} = "{{$json['Contact ID']}}"`

#### 7. IF: Contact Exists?
**Node Type**: IF
**Condition**: `{{$node["Airtable: Check Contact Exists"].json.records.length}} > 0`

#### 8a. Airtable: Update Contact (TRUE branch)
**Node Type**: Airtable
**Operation**: Update
**Record ID**: `{{$node["Airtable: Check Contact Exists"].json.records[0].id}}`
**Fields**: Map all fields from Google Sheets

#### 8b. Airtable: Create Contact (FALSE branch)
**Node Type**: Airtable
**Operation**: Create
**Fields**: Map all fields from Google Sheets

#### 9. Merge Branches
**Node Type**: Merge
**Mode**: Merge By Position

#### 10. Log Sync Results
**Node Type**: Code
**Language**: JavaScript
```javascript
const results = {
  syncId: $node["Set Sync Timestamp"].json.syncId,
  totalProcessed: items.length,
  updated: items.filter(i => i.json.operation === 'update').length,
  created: items.filter(i => i.json.operation === 'create').length,
  errors: items.filter(i => i.json.error).length,
  completedAt: new Date().toISOString()
};
console.log('Sync Results:', results);
return [{ json: results }];
```

#### 11. Update Last Sync Time
**Node Type**: Google Sheets
**Operation**: Update
**Sheet**: Sync Metadata (hidden sheet)
**Range**: A2
**Value**: `{{$node["Set Sync Timestamp"].json.syncStartTime}}`

#### 12. Error Handler
**Node Type**: Error Trigger
**Actions**:
- Log error to Google Sheets error log
- Send Slack notification
- Retry after 5 minutes (max 3 retries)

### Configuration

**Settings**:
- Timeout: 30 minutes
- Error Workflow: Error Logging WF
- Retry On Fail: Yes (3 times, 5 min delay)

**Credentials**:
- Google OAuth2 (sheets.readonly, sheets.write)
- Airtable Personal Access Token

### Performance Optimization

- Process in batches of 50 to avoid rate limits
- Only sync modified records (delta sync)
- Cache API responses for 5 minutes
- Use bulk operations where possible

---

## WF2: Campaign Initialization

### Purpose
Create new email campaign, validate contacts, generate messages, and populate queue.

### Trigger
**Type**: Webhook
**Method**: POST
**Path**: `/campaign-init`
**Authentication**: Header key

### Expected Payload
```json
{
  "campaignName": "October Follow-Up",
  "brandId": "sherrod-sports-visas",
  "workspace": "workspace-sherrod",
  "contactIds": ["CONT-2024-00001", "CONT-2024-00002"],
  "messageMode": "claude_ai",
  "templateId": "TMPL-sherrod-followup-v2",
  "deliveryMode": "scheduled",
  "scheduledFor": "2024-10-23T10:00:00Z",
  "campaignType": "follow_up",
  "subject": "",
  "body": "",
  "createdBy": "admin@system.com"
}
```

### Workflow Steps

#### 1. Webhook Trigger
Receive campaign creation request

#### 2. Validate Payload
**Node Type**: Code
**Action**: Validate required fields
```javascript
const required = ['campaignName', 'brandId', 'contactIds', 'messageMode'];
const missing = required.filter(field => !$json[field]);
if (missing.length > 0) {
  throw new Error(`Missing required fields: ${missing.join(', ')}`);
}
return items;
```

#### 3. Generate Campaign ID
**Node Type**: Set
```javascript
{
  "campaignId": "CAMP-{{$now.toFormat('yyyy')}}-{{$now.toFormat('yyyyMMddHHmmss')}}",
  "createdAt": "{{$now.toISO()}}"
}
```

#### 4. Load Brand Configuration
**Node Type**: Google Sheets
**Operation**: Lookup
**Sheet**: Brand Configuration
**Match Column**: Brand ID
**Match Value**: `{{$json.brandId}}`
**Return**: All columns

#### 5. Load Contacts
**Node Type**: Google Sheets
**Operation**: Lookup
**Sheet**: Ultimate Contact Sheet
**Match Column**: Contact ID
**Match Values**: `{{$json.contactIds}}`
**Return**: All columns

#### 6. Split Contacts
**Node Type**: Split In Batches
**Batch Size**: 10

#### 7. Frequency Validation
**Node Type**: Function
**Action**: Check frequency limits
```javascript
const contactId = $json['Contact ID'];
const brand = $node["Load Brand Configuration"].json;

// Load send history for this contact
const sentLast24h = $json['Emails Sent 24h'];
const sentLast7d = $json['Emails Sent 7d'];
const sentLast30d = $json['Emails Sent 30d'];

// Check hard limits
const limits = {
  '24h': { max: 1, current: sentLast24h },
  '7d': { max: 3, current: sentLast7d },
  '30d': { max: 10, current: sentLast30d }
};

let passed = true;
let warnings = [];

if (limits['24h'].current >= limits['24h'].max) {
  passed = false;
  warnings.push(`Hard limit: ${limits['24h'].current}/${limits['24h'].max} emails in 24h`);
}
if (limits['7d'].current >= limits['7d'].max) {
  passed = false;
  warnings.push(`Hard limit: ${limits['7d'].current}/${limits['7d'].max} emails in 7d`);
}
if (limits['30d'].current >= limits['30d'].max) {
  passed = false;
  warnings.push(`Hard limit: ${limits['30d'].current}/${limits['30d'].max} emails in 30d`);
}

// Check opt-out status
if ($json['Opt-Out Status'] !== 'Active') {
  passed = false;
  warnings.push(`Contact opted out: ${$json['Opt-Out Status']}`);
}

return [{
  json: {
    ...$json,
    frequencyValidation: {
      passed,
      warnings,
      limits
    }
  }
}];
```

#### 8. IF: Validation Passed?
**Condition**: `{{$json.frequencyValidation.passed}} === true`

#### 9a. Generate Message (TRUE branch)
**Action**: Depends on messageMode

##### If messageMode = "claude_ai"
**Node Type**: HTTP Request (call WF5)
**Method**: POST
**URL**: `{{$env.N8N_HOST}}/webhook/claude-generate`
**Body**:
```json
{
  "contact": "{{$json}}",
  "brand": "{{$node['Load Brand Configuration'].json}}",
  "campaignType": "{{$node['Webhook'].json.campaignType}}",
  "context": {
    "daysSinceContact": "{{$json['Days Since Contact']}}",
    "leadStatus": "{{$json['Lead Status']}}",
    "leadScore": "{{$json['Lead Score']}}",
    "engagementScore": "{{$json['Engagement Score']}}"
  }
}
```

##### If messageMode = "template"
**Node Type**: Google Sheets
**Operation**: Lookup template and replace variables

##### If messageMode = "manual"
**Node Type**: Set
**Action**: Use subject/body from payload

#### 9b. Log Blocked Contact (FALSE branch)
**Node Type**: Google Sheets
**Operation**: Append
**Sheet**: Campaign Errors Log
**Data**: Contact ID, Campaign ID, Block Reason

#### 10. Create Queue Entry
**Node Type**: Google Sheets
**Operation**: Append Row
**Sheet**: Campaign Queue
**Data**:
```javascript
{
  "Queue ID": "QUEUE-{{$now.toFormat('yyyy')}}-{{$now.toFormat('yyyyMMddHHmmss')}}",
  "Campaign ID": "{{$node['Generate Campaign ID'].json.campaignId}}",
  "Contact ID": "{{$json['Contact ID']}}",
  "Contact Email": "{{$json['Email']}}",
  "Contact Name": "{{$json['First Name']}} {{$json['Last Name']}}",
  "Brand ID": "{{$node['Load Brand Configuration'].json['Brand ID']}}",
  "Brand Name": "{{$node['Load Brand Configuration'].json['Brand Name']}}",
  "Subject": "{{$node['Generate Message'].json.subject}}",
  "Body": "{{$node['Generate Message'].json.body}}",
  "Status": "Ready",
  "Priority": "Normal",
  "Scheduled For": "{{$node['Webhook'].json.scheduledFor}}",
  "Created At": "{{$now.toISO()}}",
  "Validation Passed": "TRUE",
  "Frequency Check 24h": "{{$json.frequencyValidation.limits['24h'].current < 1}}",
  "Frequency Check 7d": "{{$json.frequencyValidation.limits['7d'].current < 3}}",
  "Frequency Check 30d": "{{$json.frequencyValidation.limits['30d'].current < 10}}"
}
```

#### 11. Create Airtable Campaign Record
**Node Type**: Airtable
**Operation**: Create
**Table**: Campaigns
**Fields**:
```javascript
{
  "Campaign ID": "{{$node['Generate Campaign ID'].json.campaignId}}",
  "Campaign Name": "{{$node['Webhook'].json.campaignName}}",
  "Brand": ["{{$node['Load Brand Configuration'].json.airtableRecordId}}"],
  "Status": "Scheduled",
  "Campaign Type": "{{$node['Webhook'].json.campaignType}}",
  "Delivery Mode": "{{$node['Webhook'].json.deliveryMode}}",
  "Message Mode": "{{$node['Webhook'].json.messageMode}}",
  "Total Recipients": "{{$node['Load Contacts'].json.length}}",
  "Scheduled For": "{{$node['Webhook'].json.scheduledFor}}",
  "Created By": "{{$node['Webhook'].json.createdBy}}"
}
```

#### 12. Return Success Response
**Node Type**: Respond to Webhook
**Status**: 200
**Body**:
```json
{
  "success": true,
  "campaignId": "{{$node['Generate Campaign ID'].json.campaignId}}",
  "totalContacts": "{{$node['Load Contacts'].json.length}}",
  "validContacts": "{{$node['Create Queue Entry'].json.length}}",
  "blockedContacts": "{{$node['Log Blocked Contact'].json.length}}",
  "scheduledFor": "{{$node['Webhook'].json.scheduledFor}}",
  "message": "Campaign created successfully"
}
```

### Error Handling

**On Frequency Validation Fail**:
- Log to Campaign Errors Log
- Continue with other contacts
- Include in response summary

**On Message Generation Fail**:
- Retry 3 times
- Fall back to template if available
- Log error and notify admin

**On Critical Fail**:
- Rollback campaign creation
- Return error response
- Send alert notification

---

## WF3: Execute Queue

### Purpose
Process campaign queue every 5 minutes, validate frequency one more time, write to Lido for sending.

### Trigger
**Type**: Schedule (CRON)
**Schedule**: `*/5 * * * *` (every 5 minutes)

### Workflow Steps

#### 1. CRON Trigger

#### 2. Load Ready Queue Entries
**Node Type**: Google Sheets
**Operation**: Read
**Sheet**: Campaign Queue
**Filter Formula**:
```
=AND(
  Status="Ready",
  Scheduled For <= NOW(),
  Validation Passed=TRUE
)
```
**Limit**: 50 (batch size)

#### 3. IF: Any Entries?
**Condition**: `{{$json.length}} > 0`

#### 4. Split Into Items
**Node Type**: Item Lists
**Operation**: Split Out

#### 5. Re-Validate Frequency
**Node Type**: Function
**Action**: Double-check frequency limits
```javascript
// Re-query send history to ensure no emails sent since campaign creation
const contactId = $json['Contact ID'];

// Query Send History Log for this contact
const recentSends = await $googleSheets.query({
  sheet: 'Send History Log',
  filter: `Contact ID="${contactId}" AND Sent At >= ${Date.now() - 24*60*60*1000}`
});

const sentLast24h = recentSends.length;

if (sentLast24h >= 1) {
  return [{
    json: {
      ...$json,
      revalidationPassed: false,
      revalidationReason: '24h limit reached since campaign creation'
    }
  }];
}

return [{
  json: {
    ...$json,
    revalidationPassed: true
  }
}];
```

#### 6. IF: Revalidation Passed?
**Condition**: `{{$json.revalidationPassed}} === true`

#### 7a. Generate Tracking URLs (TRUE branch)
**Node Type**: Set
```javascript
const queueId = $json['Queue ID'];
const trackingDomain = $env.TRACKING_DOMAIN;

return [{
  json: {
    ...$json,
    trackingPixelUrl: `https://${trackingDomain}/pixel/${queueId}`,
    trackingLinks: {} // Will be injected into email HTML
  }
}];
```

#### 8a. Write to Lido Send Queue
**Node Type**: Google Sheets
**Operation**: Append Row
**Spreadsheet**: Lido Spreadsheet
**Sheet**: Send Queue
**Data**:
```javascript
{
  "Queue ID": "{{$json['Queue ID']}}",
  "Campaign ID": "{{$json['Campaign ID']}}",
  "To Email": "{{$json['Contact Email']}}",
  "To Name": "{{$json['Contact Name']}}",
  "From Email": "{{$node['Load Brand'].json['Email']}}",
  "From Name": "{{$node['Load Brand'].json['From Name']}}",
  "Reply-To": "{{$node['Load Brand'].json['Reply-To Email']}}",
  "Subject": "{{$json['Subject']}}",
  "Body HTML": "{{$json['Body']}}<img src='{{$json.trackingPixelUrl}}' width='1' height='1' />",
  "Tracking Pixel": "{{$json.trackingPixelUrl}}",
  "Status": "Pending",
  "Created At": "{{$now.toISO()}}"
}
```

#### 9a. Update Queue Status
**Node Type**: Google Sheets
**Operation**: Update Row
**Match Column**: Queue ID
**Match Value**: `{{$json['Queue ID']}}`
**Update**:
```javascript
{
  "Status": "Sending",
  "Started Sending At": "{{$now.toISO()}}",
  "Lido Row ID": "{{$node['Write to Lido'].json.rowNumber}}"
}
```

#### 7b. Update Queue Status - Blocked (FALSE branch)
**Node Type**: Google Sheets
**Operation**: Update Row
**Update**:
```javascript
{
  "Status": "Blocked",
  "Error Message": "{{$json.revalidationReason}}"
}
```

#### 10. Aggregate Results
**Node Type**: Code
```javascript
const results = {
  totalProcessed: items.length,
  sent: items.filter(i => i.json.Status === 'Sending').length,
  blocked: items.filter(i => i.json.Status === 'Blocked').length,
  timestamp: new Date().toISO()
};
console.log('Queue Execution Results:', results);
return [{ json: results }];
```

### Rate Limiting

**Batch Size**: 50 emails per 5-minute cycle
**Daily Cap**: Respect brand daily limits
**Hourly Cap**: Respect brand hourly limits

**Implementation**:
- Check brand current counters before processing
- Pause if limits reached
- Resume in next cycle

---

## WF4: Track Opens and Clicks

### Purpose
Receive tracking events from Lido, update engagement metrics across all systems.

### Trigger
**Type**: Webhook
**Method**: POST
**Path**: `/track-event`
**Authentication**: Header key

### Expected Payload
```json
{
  "eventType": "open",
  "queueId": "QUEUE-2024-12345",
  "contactEmail": "john.smith@example.com",
  "timestamp": "2024-10-22T14:35:00Z",
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1"
}
```

### Workflow Steps

#### 1. Webhook Trigger

#### 2. Validate Event
**Node Type**: Code
**Action**: Validate payload and deduplicate

#### 3. Load Queue Entry
**Node Type**: Google Sheets
**Operation**: Lookup
**Match Column**: Queue ID

#### 4. Load Contact
**Node Type**: Google Sheets
**Operation**: Lookup
**Match Column**: Contact ID

#### 5. Load Campaign
**Node Type**: Airtable
**Operation**: Get
**Filter**: Campaign ID

#### 6. Update Send History
**Node Type**: Google Sheets
**Operation**: Update
**Action**: Based on event type
```javascript
// For open event
{
  "Opened": "TRUE",
  "Opened At": "{{$json.timestamp}}",
  "Open Count": "{{$json.existingOpenCount + 1}}",
  "Last Opened At": "{{$json.timestamp}}"
}

// For click event
{
  "Clicked": "TRUE",
  "Clicked At": "{{$json.timestamp}}",
  "Click Count": "{{$json.existingClickCount + 1}}",
  "Last Clicked At": "{{$json.timestamp}}"
}
```

#### 7. Update Contact Metrics
**Node Type**: Google Sheets
**Operation**: Update
```javascript
{
  "Total Emails Opened": "{{$json.totalOpened + 1}}",
  "Last Opened Date": "{{$json.timestamp}}",
  "Engagement Score": "{{calculated}}",
  "Last Modified": "{{$now.toISO()}}"
}
```

#### 8. Recalculate Engagement Score
**Node Type**: Function
```javascript
const contact = $node["Load Contact"].json;
const openRate = contact['Total Emails Opened'] / contact['Total Emails Sent'];
const clickRate = contact['Total Emails Clicked'] / contact['Total Emails Sent'];
const replyRate = contact['Total Emails Replied'] / contact['Total Emails Sent'];

const engagementScore = (openRate * 40) + (clickRate * 40) + (replyRate * 20);

return [{
  json: {
    engagementScore: Math.round(engagementScore * 100)
  }
}];
```

#### 9. Update Campaign Stats
**Node Type**: Airtable
**Operation**: Update
**Action**: Increment counters
```javascript
{
  "Total Opened": "{{$json.currentOpened + 1}}",
  "Open Rate": "{{calculated}}"
}
```

#### 10. Check for Auto-Pilot Trigger
**Node Type**: IF
**Condition**: High engagement + specific criteria
**Action**: Trigger follow-up workflow

#### 11. Return Success
**Node Type**: Respond to Webhook
**Status**: 200
**Body**: `{ "success": true, "event": "tracked" }`

---

## WF5: Claude AI Email Generation

### Purpose
Generate personalized emails using Claude API based on contact context and brand voice.

### Trigger
**Type**: Webhook (called by WF2)
**Method**: POST
**Path**: `/claude-generate`

### Expected Payload
```json
{
  "contact": { /* full contact object */ },
  "brand": { /* full brand object */ },
  "campaignType": "follow_up",
  "context": {
    "daysSinceContact": 14,
    "leadStatus": "Hot",
    "leadScore": 8,
    "engagementScore": 75
  }
}
```

### Workflow Steps

#### 1. Webhook Trigger

#### 2. Build System Prompt
**Node Type**: Code
```javascript
const brand = $json.brand;
const systemPrompt = `You are an expert email writer for ${brand['Brand Name']}.

BRAND VOICE:
- Tone: ${brand['Voice Tone']}
- Style: ${brand['Voice Style']}
- Personality: ${brand['Voice Personality']}

KEY PHRASES TO USE: ${brand['Key Phrases']}
PHRASES TO AVOID: ${brand['Avoid Phrases']}

Your task is to write personalized, engaging emails that convert leads while maintaining the brand voice.`;

return [{ json: { systemPrompt } }];
```

#### 3. Build User Prompt
**Node Type**: Code
```javascript
const contact = $json.contact;
const context = $json.context;
const campaign = $json.campaignType;

const userPrompt = `Write a ${campaign} email for this contact:

CONTACT INFORMATION:
- Name: ${contact['First Name']} ${contact['Last Name']}
- Lead Status: ${context.leadStatus}
- Lead Score: ${context.leadScore}/10
- Visa Type: ${contact['Visa Type']}
- Days Since Last Contact: ${context.daysSinceContact}
- Engagement Score: ${context.engagementScore}%

REQUIREMENTS:
1. Write a compelling subject line (max 60 characters)
2. Personalize the email body based on their status and engagement
3. Include a clear call-to-action
4. Match the brand voice guidelines
5. Keep it concise (200-300 words)
6. Use their first name naturally

Return ONLY valid JSON in this exact format:
{
  "subject": "Your subject line here",
  "body": "Your email body here (plain text, use \\n for line breaks)"
}`;

return [{ json: { userPrompt } }];
```

#### 4. Call Claude API
**Node Type**: HTTP Request
**Method**: POST
**URL**: `https://api.anthropic.com/v1/messages`
**Headers**:
```json
{
  "x-api-key": "{{$env.ANTHROPIC_API_KEY}}",
  "anthropic-version": "2023-06-01",
  "content-type": "application/json"
}
```
**Body**:
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1000,
  "temperature": 0.7,
  "system": "{{$node['Build System Prompt'].json.systemPrompt}}",
  "messages": [
    {
      "role": "user",
      "content": "{{$node['Build User Prompt'].json.userPrompt}}"
    }
  ]
}
```

#### 5. Parse Claude Response
**Node Type**: Code
```javascript
const response = $json.content[0].text;

// Extract JSON from response
let emailData;
try {
  // Try to parse as direct JSON
  emailData = JSON.parse(response);
} catch (e) {
  // Try to extract JSON from markdown code block
  const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    emailData = JSON.parse(jsonMatch[1]);
  } else {
    throw new Error('Failed to parse Claude response');
  }
}

// Validate required fields
if (!emailData.subject || !emailData.body) {
  throw new Error('Missing required fields in Claude response');
}

return [{
  json: {
    subject: emailData.subject,
    body: emailData.body,
    generatedBy: 'claude-sonnet-4',
    generatedAt: new Date().toISOString(),
    inputTokens: $json.usage.input_tokens,
    outputTokens: $json.usage.output_tokens,
    cost: (($json.usage.input_tokens * 0.000003) + ($json.usage.output_tokens * 0.000015)).toFixed(6)
  }
}];
```

#### 6. Post-Process Email
**Node Type**: Code
**Action**: Add signature, format HTML
```javascript
const brand = $node["Webhook"].json.brand;
const email = $json;

// Add signature
email.body = email.body + '\n\n' + brand['Signature'];

// Convert to HTML
email.bodyHtml = email.body
  .replace(/\n\n/g, '</p><p>')
  .replace(/\n/g, '<br/>')
  .replace(/^(.*)$/, '<p>$1</p>');

return [{ json: email }];
```

#### 7. Return Generated Email
**Node Type**: Respond to Webhook
**Status**: 200
**Body**:
```json
{
  "success": true,
  "subject": "{{$json.subject}}",
  "body": "{{$json.body}}",
  "bodyHtml": "{{$json.bodyHtml}}",
  "metadata": {
    "generatedBy": "{{$json.generatedBy}}",
    "generatedAt": "{{$json.generatedAt}}",
    "cost": "{{$json.cost}}"
  }
}
```

### Error Handling

**On API Failure**:
- Retry 3 times with exponential backoff
- Log error with full context
- Fall back to template if available
- Return error response

**On Parse Failure**:
- Log raw response
- Attempt multiple parsing strategies
- Return error with details

---

## WF6: Auto-Pilot Mode

### Purpose
Automatically identify stale high-value leads and trigger follow-up campaigns.

### Trigger
**Type**: Schedule (CRON)
**Schedule**: `0 9 * * *` (daily at 9am)
**Timezone**: America/New_York

### Workflow Steps

#### 1. CRON Trigger

#### 2. Load Auto-Pilot Configuration
**Node Type**: HTTP Request
**URL**: Local config file or environment vars

#### 3. Query Stale Hot Leads
**Node Type**: Google Sheets
**Operation**: Read with Filter
**Formula**:
```
=AND(
  Lead Status="Hot",
  Lead Score >= 7,
  Days Since Contact >= 7,
  Days Since Contact <= 30,
  Engagement Score >= 40,
  Opt-Out Status="Active"
)
```

#### 4. Filter by Frequency Limits
**Node Type**: Function
**Action**: Apply stricter limits for auto-pilot
```javascript
const stricterMultiplier = 0.8;
return items.filter(item => {
  const contact = item.json;
  return (
    contact['Emails Sent 24h'] === 0 &&
    contact['Emails Sent 7d'] < (3 * stricterMultiplier) &&
    contact['Emails Sent 30d'] < (10 * stricterMultiplier)
  );
});
```

#### 5. Group by Brand
**Node Type**: Code
**Action**: Group contacts by primary brand

#### 6. For Each Brand
**Node Type**: Split In Batches

#### 7. Create Auto-Pilot Campaign
**Node Type**: HTTP Request (call WF2)
**Method**: POST
**URL**: `{{$env.N8N_HOST}}/webhook/campaign-init`
**Body**:
```json
{
  "campaignName": "Auto-Pilot Follow-Up - {{$now.toFormat('yyyy-MM-dd')}}",
  "brandId": "{{$json.brandId}}",
  "workspace": "{{$json.workspaceId}}",
  "contactIds": "{{$json.contactIds}}",
  "messageMode": "claude_ai",
  "deliveryMode": "immediate",
  "campaignType": "auto_pilot_followup",
  "createdBy": "auto-pilot-system"
}
```

#### 8. Log Auto-Pilot Activity
**Node Type**: Google Sheets
**Operation**: Append
**Sheet**: Auto-Pilot Log
**Data**:
```javascript
{
  "Date": "{{$now.toISO()}}",
  "Total Eligible": "{{$node['Query Stale Hot Leads'].json.length}}",
  "Passed Frequency": "{{$node['Filter by Frequency Limits'].json.length}}",
  "Campaigns Created": "{{$node['Create Auto-Pilot Campaign'].json.length}}",
  "Brands": "{{$json.brands.join(', ')}}"
}
```

#### 9. Send Summary Report
**Node Type**: Email / Slack
**Action**: Send daily summary to team

---

## Setup Instructions

### 1. Import Workflows

```bash
# In n8n UI:
1. Go to Workflows
2. Click "Import from File"
3. Select workflow JSON from /n8n-workflows
4. Repeat for all 6 workflows
```

### 2. Configure Credentials

**Google OAuth2**:
```
1. n8n Settings → Credentials → Add Credential
2. Select "Google OAuth2 API"
3. Follow OAuth flow
4. Grant access to Sheets
```

**Airtable**:
```
1. Add Credential → Airtable Personal Access Token
2. Paste your Airtable API key
3. Test connection
```

**Anthropic**:
```
1. Add Credential → HTTP Header Auth
2. Name: x-api-key
3. Value: Your Anthropic API key
```

### 3. Update Environment Variables

In each workflow, update:
- Spreadsheet IDs
- Base IDs
- Table names
- Webhook URLs
- Tracking domain

### 4. Test Each Workflow

**WF1 - Data Sync**:
```
1. Add test contact to Google Sheets
2. Trigger workflow manually
3. Verify sync to Airtable
4. Check logs for errors
```

**WF2 - Campaign Init**:
```
1. Send test webhook with single contact
2. Verify queue entry created
3. Check message generation
4. Confirm Airtable campaign record
```

**WF3 - Execute Queue**:
```
1. Manually set queue status to "Ready"
2. Trigger workflow
3. Verify Lido sheet entry
4. Check status updates
```

**WF4 - Track Opens**:
```
1. Send test tracking webhook
2. Verify metrics updated
3. Check all linked records
```

**WF5 - Claude Generation**:
```
1. Call with test contact data
2. Verify email generated
3. Check brand voice adherence
4. Validate JSON format
```

**WF6 - Auto-Pilot**:
```
1. Set up test contacts meeting criteria
2. Trigger manually
3. Verify campaigns created
4. Check frequency limits respected
```

### 5. Enable Production Mode

```
1. Set all CRON workflows to active
2. Configure webhook authentication
3. Enable error notifications
4. Set up monitoring
```

---

## Monitoring & Maintenance

### Daily Checks
- Review error logs
- Check sync status
- Monitor API quotas
- Verify deliverability

### Weekly Tasks
- Analyze workflow performance
- Review auto-pilot effectiveness
- Optimize slow queries
- Update frequency rules

### Monthly Tasks
- Audit credentials
- Review and optimize workflows
- Update Claude prompts based on performance
- Clean up old logs

---

**Document Version**: 1.0
**Last Updated**: 2025-10-22
**Next Review**: Bi-weekly
