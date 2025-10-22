# Airtable Base Schema Documentation

## Overview

Airtable serves as the **relational database** for the Multi-Brand Email Automation System, providing powerful linking, filtering, and native webhook capabilities that complement Google Sheets.

**Base Structure**: 5 interconnected tables with relationship links

**Sync Strategy**: Bidirectional sync with Google Sheets every hour via n8n

---

## Table 1: Contacts

### Purpose
Synced contact records with rich relationships to campaigns, brands, and send history.

### Field Schema

| Field Name | Field Type | Options | Description |
|------------|-----------|---------|-------------|
| Contact ID | Single line text | Primary field | Unique identifier from Google Sheets |
| First Name | Single line text | | Contact's first name |
| Last Name | Single line text | | Contact's last name |
| Full Name | Formula | `{First Name} & " " & {Last Name}` | Computed full name |
| Email | Email | | Primary email address |
| Phone | Phone number | | Phone number |
| Company | Single line text | | Company name |
| Job Title | Single line text | | Current position |
| Lead Status | Single select | Hot, Warm, Cold, Inactive | Current lead status |
| Lead Score | Number | Integer, 0-10 | Score from 0-10 |
| Visa Type | Single select | O1, EB1, EB2, EB3, L1, E2, P1, H1B, Other | Target visa category |
| Visa Status | Single select | Initial, In Progress, Approved, Denied | Current visa status |
| Country of Origin | Single line text | | Nationality |
| Current Location | Single line text | | Current city/state |
| Associated Brands | Link to Brands | Multiple | Linked brand records |
| Primary Brand | Link to Brands | Single | Main managing brand |
| Opt-Out Status | Single select | Active, Opt-Out Global, Opt-Out Brand | Email opt-out status |
| Opt-Out Date | Date | | Date of opt-out |
| Opt-Out Reason | Long text | | Reason for opt-out |
| Total Emails Sent | Number | Integer | Lifetime email count |
| Emails Sent 24h | Number | Integer | Emails in last 24 hours |
| Emails Sent 7d | Number | Integer | Emails in last 7 days |
| Emails Sent 30d | Number | Integer | Emails in last 30 days |
| Total Emails Opened | Number | Integer | Lifetime opens |
| Total Emails Clicked | Number | Integer | Lifetime clicks |
| Total Emails Replied | Number | Integer | Lifetime replies |
| Last Opened Date | Date | Include time | Most recent open |
| Last Clicked Date | Date | Include time | Most recent click |
| Last Replied Date | Date | Include time | Most recent reply |
| Last Contacted Date | Date | Include time | Most recent email sent |
| First Contact Date | Date | Include time | Initial email sent |
| Engagement Score | Number | Decimal, 0-100 | Calculated engagement |
| Engagement Tier | Single select | High, Medium, Low, None | Engagement category |
| Days Since Contact | Number | Integer | Days since last email |
| Campaigns | Link to Campaigns | Multiple | Participated campaigns |
| Campaign Count | Count | Count of {Campaigns} | Total campaigns |
| Last Campaign | Lookup | From {Campaigns} | Most recent campaign |
| Send History | Link to Send History | Multiple | All emails sent |
| Source | Single select | Website, Referral, LinkedIn, Event, Cold Outreach, Partner | Lead source |
| Source Date | Date | | Date added to system |
| Referred By | Single line text | | Referrer name |
| Tags | Multiple select | Hot Lead, Athlete, Tech, Business, etc. | Custom tags |
| Notes | Long text | | Internal notes |
| Last Modified | Last modified time | | Auto-tracked |
| Created Date | Created time | | Auto-tracked |
| Created By | Single line text | | User who created |
| Google Sheets Sync | Checkbox | | Synced to Sheets |
| Last Sync Time | Date | Include time | Last sync timestamp |

### Views

#### 1. All Contacts (Default)
- **Sort**: Last Modified (newest first)
- **Filter**: None
- **Group**: Lead Status

#### 2. Hot Leads
- **Filter**: Lead Status = "Hot"
- **Sort**: Lead Score (highest first)
- **Color**: Red

#### 3. Needs Follow-Up
- **Filter**:
  - Days Since Contact > 7
  - Lead Status ≠ "Inactive"
  - Opt-Out Status = "Active"
- **Sort**: Days Since Contact (highest first)
- **Color**: Orange

#### 4. High Engagement
- **Filter**: Engagement Score >= 80
- **Sort**: Engagement Score (highest first)
- **Color**: Green

#### 5. Opted Out
- **Filter**: Opt-Out Status ≠ "Active"
- **Sort**: Opt-Out Date (newest first)
- **Color**: Gray

#### 6. By Brand
- **Group**: Primary Brand
- **Sort**: Last Contacted Date (newest first)

### Automations

#### 1. Update Engagement Tier
**Trigger**: When record updated (Engagement Score field)
**Actions**:
- If Engagement Score >= 80: Set Engagement Tier to "High"
- If Engagement Score 50-79: Set Engagement Tier to "Medium"
- If Engagement Score 20-49: Set Engagement Tier to "Low"
- If Engagement Score < 20: Set Engagement Tier to "None"

#### 2. Flag Stale Leads
**Trigger**: Daily at 9am
**Actions**:
- Find records where Days Since Contact > 30
- Add "Needs Follow-Up" tag
- Send Slack notification to campaign manager

#### 3. Sync Confirmation
**Trigger**: When Google Sheets Sync checkbox changed to checked
**Actions**:
- Update Last Sync Time to now
- Log to activity feed

---

## Table 2: Campaigns

### Purpose
Campaign tracking and management with performance analytics.

### Field Schema

| Field Name | Field Type | Options | Description |
|------------|-----------|---------|-------------|
| Campaign ID | Single line text | Primary field | Unique identifier |
| Campaign Name | Single line text | | Display name |
| Brand | Link to Brands | Single | Associated brand |
| Brand Name | Lookup | From {Brand} | Brand display name |
| Status | Single select | Draft, Scheduled, Running, Paused, Completed, Cancelled | Campaign status |
| Campaign Type | Single select | Promotional, Follow-Up, Transactional, Educational | Campaign category |
| Delivery Mode | Single select | Immediate, Scheduled, Drip, Auto-Pilot | Send timing |
| Message Mode | Single select | Claude AI, Template, Manual, Hybrid | Generation method |
| Template | Link to Templates | Single | Template used (if any) |
| Subject | Single line text | | Email subject (if manual) |
| Body | Long text | | Email body (if manual) |
| Target Contacts | Link to Contacts | Multiple | Recipients |
| Total Recipients | Count | Count of {Target Contacts} | Recipient count |
| Queue Entries | Link to Campaign Queue | Multiple | Queue records |
| Total Queued | Count | Count of {Queue Entries} | Queued emails |
| Total Sent | Number | Integer | Successfully sent |
| Total Delivered | Number | Integer | Delivery confirmed |
| Total Opened | Number | Integer | Emails opened |
| Total Clicked | Number | Integer | Links clicked |
| Total Replied | Number | Integer | Replies received |
| Total Bounced | Number | Integer | Bounced emails |
| Total Failed | Number | Integer | Failed sends |
| Delivery Rate | Formula | `{Total Delivered}/{Total Sent}*100` | Delivery % |
| Open Rate | Formula | `{Total Opened}/{Total Delivered}*100` | Open % |
| Click Rate | Formula | `{Total Clicked}/{Total Delivered}*100` | Click % |
| Reply Rate | Formula | `{Total Replied}/{Total Delivered}*100` | Reply % |
| Bounce Rate | Formula | `{Total Bounced}/{Total Sent}*100` | Bounce % |
| Performance Score | Formula | `({Open Rate}*0.4 + {Click Rate}*0.4 + {Reply Rate}*0.2)` | Weighted score |
| Scheduled For | Date | Include time | Send schedule |
| Started At | Date | Include time | Campaign start |
| Completed At | Date | Include time | Campaign completion |
| Duration Minutes | Number | Integer | Campaign duration |
| Average Open Time Hours | Number | Decimal | Avg time to open |
| Average Click Time Hours | Number | Decimal | Avg time to click |
| Average Response Time Hours | Number | Decimal | Avg time to reply |
| Cost Estimate | Currency | USD | Estimated AI costs |
| Actual Cost | Currency | USD | Actual costs incurred |
| Created By | Single line text | | Campaign creator |
| Tags | Multiple select | | Custom tags |
| Notes | Long text | | Campaign notes |
| Created Date | Created time | | Auto-tracked |
| Last Modified | Last modified time | | Auto-tracked |
| Google Sheets Sync | Checkbox | | Synced to Sheets |

### Views

#### 1. Active Campaigns
- **Filter**: Status IN [Running, Scheduled]
- **Sort**: Scheduled For (soonest first)
- **Color**: Green

#### 2. Completed Campaigns
- **Filter**: Status = "Completed"
- **Sort**: Completed At (newest first)
- **Group**: Brand

#### 3. High Performers
- **Filter**:
  - Status = "Completed"
  - Performance Score >= 70
- **Sort**: Performance Score (highest first)
- **Color**: Gold

#### 4. Needs Attention
- **Filter**:
  - Status = "Running"
  - Open Rate < 20
- **Color**: Red

#### 5. By Brand
- **Group**: Brand
- **Sort**: Created Date (newest first)

#### 6. Calendar View
- **View Type**: Calendar
- **Date Field**: Scheduled For

### Automations

#### 1. Campaign Started Notification
**Trigger**: When Status changes to "Running"
**Actions**:
- Update Started At to now
- Send Slack notification
- Log to activity feed

#### 2. Campaign Completed Actions
**Trigger**: When Status changes to "Completed"
**Actions**:
- Update Completed At to now
- Calculate Duration Minutes
- Send performance summary email
- Archive if > 90 days old

#### 3. Low Performance Alert
**Trigger**: When Open Rate < 15% and Total Sent >= 50
**Actions**:
- Send alert to campaign manager
- Add "Needs Review" tag
- Create follow-up task

---

## Table 3: Campaign Queue

### Purpose
Active queue for email scheduling and sending with real-time status tracking.

### Field Schema

| Field Name | Field Type | Options | Description |
|------------|-----------|---------|-------------|
| Queue ID | Single line text | Primary field | Unique queue identifier |
| Campaign | Link to Campaigns | Single | Parent campaign |
| Campaign Name | Lookup | From {Campaign} | Campaign display name |
| Contact | Link to Contacts | Single | Recipient |
| Contact Email | Lookup | From {Contact} | Recipient email |
| Contact Name | Lookup | From {Contact} | Recipient full name |
| Brand | Link to Brands | Single | Sending brand |
| Brand Name | Lookup | From {Brand} | Brand display name |
| Subject | Single line text | | Email subject |
| Body | Long text | | Email body (HTML) |
| Template | Link to Templates | Single | Template used |
| Generation Method | Single select | Claude AI, Template, Manual | Creation method |
| Status | Single select | Pending, Ready, Sending, Sent, Failed, Blocked | Queue status |
| Priority | Single select | High, Normal, Low | Send priority |
| Scheduled For | Date | Include time | When to send |
| Validated At | Date | Include time | Frequency check passed |
| Started Sending At | Date | Include time | Send initiated |
| Completed At | Date | Include time | Send completed |
| Error Message | Long text | | Error details |
| Retry Count | Number | Integer | Retry attempts |
| Next Retry At | Date | Include time | Next retry time |
| Lido Row ID | Single line text | | Lido sheet reference |
| Frequency Check 24h | Checkbox | | 24h limit passed |
| Frequency Check 7d | Checkbox | | 7d limit passed |
| Frequency Check 30d | Checkbox | | 30d limit passed |
| Frequency Warnings | Long text | | Warning messages |
| Validation Passed | Checkbox | | All checks passed |
| Tracking Pixel URL | URL | | Open tracking URL |
| Send History | Link to Send History | Single | Created history record |
| Processing Time MS | Number | Integer | Generation time |
| Created At | Created time | | Auto-tracked |
| Updated At | Last modified time | | Auto-tracked |

### Views

#### 1. Active Queue
- **Filter**: Status IN [Pending, Ready, Sending]
- **Sort**: Scheduled For (soonest first)
- **Color**: Blue

#### 2. Ready to Send
- **Filter**:
  - Status = "Ready"
  - Validation Passed = checked
  - Scheduled For <= now
- **Sort**: Priority (High first), then Scheduled For
- **Color**: Green

#### 3. Failed Sends
- **Filter**: Status = "Failed"
- **Sort**: Updated At (newest first)
- **Color**: Red

#### 4. Blocked by Frequency
- **Filter**: Status = "Blocked"
- **Sort**: Created At (newest first)
- **Color**: Orange

#### 5. By Campaign
- **Group**: Campaign
- **Sort**: Status, then Scheduled For

#### 6. Timeline View
- **View Type**: Timeline
- **Date Field**: Scheduled For

### Automations

#### 1. Ready to Process
**Trigger**: When Validation Passed changes to checked
**Actions**:
- If all frequency checks passed: Set Status to "Ready"
- If any frequency check failed: Set Status to "Blocked"
- Update Validated At to now

#### 2. Retry Failed Sends
**Trigger**: When Status = "Failed" and Retry Count < 3
**Actions**:
- Wait 5 minutes
- Set Status to "Pending"
- Increment Retry Count
- Set Next Retry At to now + (5 min * Retry Count)

#### 3. Stale Queue Cleanup
**Trigger**: Daily at 3am
**Actions**:
- Find records where Scheduled For < 24 hours ago and Status = "Pending"
- Set Status to "Failed"
- Set Error Message to "Expired - not sent within 24h window"

---

## Table 4: Brands

### Purpose
Brand configuration and settings with sending limits tracking.

### Field Schema

| Field Name | Field Type | Options | Description |
|------------|-----------|---------|-------------|
| Brand ID | Single line text | Primary field | Unique identifier |
| Brand Name | Single line text | | Display name |
| Brand Short Name | Single line text | | Abbreviated name |
| Email | Email | | Primary sending email |
| From Name | Single line text | | Sender display name |
| Reply-To Email | Email | | Reply address |
| Workspace ID | Single line text | | Google Workspace |
| Sending Domain | Single line text | | Email domain |
| Voice Tone | Long text | | Communication tone |
| Voice Style | Long text | | Writing style |
| Voice Personality | Long text | | Brand personality |
| Key Phrases | Long text | | Preferred phrases |
| Avoid Phrases | Long text | | Phrases to avoid |
| Signature | Long text | Rich text | Email signature |
| Default Template | Link to Templates | Single | Default template |
| Website URL | URL | | Primary website |
| Logo URL | URL | | Brand logo |
| Primary Color | Single line text | | Brand hex color |
| Secondary Color | Single line text | | Secondary hex color |
| Payment Link | URL | | Payment portal |
| Calendly Link | URL | | Scheduling link |
| StreamYard Link | URL | | Video call link |
| Daily Send Limit | Number | Integer | Max emails per day |
| Hourly Send Limit | Number | Integer | Max emails per hour |
| Current Daily Sent | Number | Integer | Today's sent count |
| Current Hourly Sent | Number | Integer | This hour's sent count |
| Daily Limit % | Formula | `{Current Daily Sent}/{Daily Send Limit}*100` | Daily usage % |
| Hourly Limit % | Formula | `{Current Hourly Sent}/{Hourly Send Limit}*100` | Hourly usage % |
| Limit Reset Time | Date | Include time | Daily counter reset |
| Status | Single select | Active, Paused, Disabled | Brand status |
| Contacts | Link to Contacts | Multiple | Associated contacts |
| Contact Count | Count | Count of {Contacts} | Total contacts |
| Campaigns | Link to Campaigns | Multiple | Brand campaigns |
| Campaign Count | Count | Count of {Campaigns} | Total campaigns |
| Templates | Link to Templates | Multiple | Brand templates |
| Template Count | Count | Count of {Templates} | Total templates |
| Total Emails Sent | Rollup | SUM({Campaigns} > {Total Sent}) | Lifetime sends |
| Total Emails Opened | Rollup | SUM({Campaigns} > {Total Opened}) | Lifetime opens |
| Average Open Rate | Rollup | AVERAGE({Campaigns} > {Open Rate}) | Avg open rate |
| Average Click Rate | Rollup | AVERAGE({Campaigns} > {Click Rate}) | Avg click rate |
| Tags | Multiple select | | Brand categorization |
| SPF Record | Single line text | | Email auth |
| DKIM Selector | Single line text | | DKIM selector |
| DMARC Policy | Single line text | | DMARC policy |
| Created Date | Created time | | Auto-tracked |
| Updated Date | Last modified time | | Auto-tracked |
| Created By | Single line text | | Creator |
| Google Sheets Sync | Checkbox | | Synced to Sheets |

### Views

#### 1. Active Brands
- **Filter**: Status = "Active"
- **Sort**: Brand Name
- **Color**: Green

#### 2. Limit Monitoring
- **Filter**: Status = "Active"
- **Fields**: Show Daily Limit %, Hourly Limit %, Current Daily Sent
- **Sort**: Daily Limit % (highest first)
- **Color**: Conditional (>80% = Red, >60% = Orange)

#### 3. Performance Dashboard
- **Group**: None
- **Fields**: Show all performance metrics
- **Sort**: Average Open Rate (highest first)

### Automations

#### 1. Limit Alert
**Trigger**: When Daily Limit % >= 80%
**Actions**:
- Send Slack alert
- Add "Approaching Limit" tag
- Notify campaign managers

#### 2. Daily Reset
**Trigger**: Daily at midnight
**Actions**:
- Set Current Daily Sent to 0
- Update Limit Reset Time
- Clear "Approaching Limit" tag

#### 3. Brand Paused Alert
**Trigger**: When Status changes to "Paused"
**Actions**:
- Pause all active campaigns for this brand
- Send notification to admin
- Log reason

---

## Table 5: Templates

### Purpose
Reusable email templates with performance tracking and A/B testing support.

### Field Schema

| Field Name | Field Type | Options | Description |
|------------|-----------|---------|-------------|
| Template ID | Single line text | Primary field | Unique identifier |
| Template Name | Single line text | | Display name |
| Brand | Link to Brands | Single | Associated brand |
| Brand Name | Lookup | From {Brand} | Brand display name |
| Category | Single select | Introduction, Follow-Up, Reminder, Thank You, Update | Template type |
| Subject Template | Long text | | Subject with variables |
| Body Template | Long text | | Body with variables |
| Variables | Multiple select | firstName, lastName, visaType, etc. | Required variables |
| Tone | Single select | Professional, Casual, Urgent, Friendly | Communication tone |
| Version | Single line text | | Version number |
| Previous Version | Link to Templates | Single | Previous version |
| Status | Single select | Active, Draft, Archived | Template status |
| Use Case | Long text | | When to use |
| Target Lead Status | Multiple select | Hot, Warm, Cold | Ideal for lead types |
| Target Visa Types | Multiple select | O1, EB1, EB2, etc. | Visa categories |
| Preview Text | Single line text | | Email preheader |
| Campaigns Used In | Link to Campaigns | Multiple | Campaigns using template |
| Times Used | Count | Count of {Campaigns Used In} | Usage count |
| Queue Entries | Link to Campaign Queue | Multiple | Queue entries |
| Last Used Date | Last modified time | | Most recent use |
| Total Sent | Number | Integer | Total sends |
| Total Opened | Number | Integer | Total opens |
| Total Clicked | Number | Integer | Total clicks |
| Total Replied | Number | Integer | Total replies |
| Open Rate | Formula | `{Total Opened}/{Total Sent}*100` | Opens / Sent |
| Click Rate | Formula | `{Total Clicked}/{Total Sent}*100` | Clicks / Sent |
| Reply Rate | Formula | `{Total Replied}/{Total Sent}*100` | Replies / Sent |
| Avg Response Time Hours | Number | Decimal | Average reply time |
| Performance Score | Formula | `({Open Rate}*0.4+{Click Rate}*0.4+{Reply Rate}*0.2)` | Weighted 0-100 |
| A/B Test Group | Single select | A, B, C, Control | Test identifier |
| A/B Test Status | Single select | Active, Winner, Loser, Neutral | Test status |
| Competitor Templates | Link to Templates | Multiple | A/B test variants |
| Tags | Multiple select | | Template tags |
| Notes | Long text | | Internal notes |
| Created Date | Created time | | Auto-tracked |
| Updated Date | Last modified time | | Auto-tracked |
| Created By | Single line text | | Creator |
| Google Sheets Sync | Checkbox | | Synced to Sheets |

### Views

#### 1. Active Templates
- **Filter**: Status = "Active"
- **Group**: Brand
- **Sort**: Template Name

#### 2. High Performers
- **Filter**:
  - Status = "Active"
  - Performance Score >= 70
  - Total Sent >= 20
- **Sort**: Performance Score (highest first)
- **Color**: Gold

#### 3. Low Performers
- **Filter**:
  - Status = "Active"
  - Performance Score < 40
  - Total Sent >= 20
- **Sort**: Performance Score (lowest first)
- **Color**: Red

#### 4. A/B Testing
- **Filter**: A/B Test Status = "Active"
- **Group**: A/B Test Group
- **Sort**: Performance Score

#### 5. By Category
- **Group**: Category
- **Sort**: Times Used (highest first)

#### 6. Recently Used
- **Sort**: Last Used Date (newest first)
- **Limit**: 50 records

### Automations

#### 1. Performance Tier Update
**Trigger**: When Total Sent changes and Total Sent >= 20
**Actions**:
- If Performance Score >= 70: Add "High Performer" tag
- If Performance Score < 40: Add "Low Performer" tag
- Send weekly summary to content team

#### 2. A/B Test Winner
**Trigger**: When Total Sent >= 100 for all test variants
**Actions**:
- Calculate winner (highest Performance Score)
- Set winner's A/B Test Status to "Winner"
- Set others to "Loser"
- Send notification with results

#### 3. Archive Old Templates
**Trigger**: Monthly on 1st
**Actions**:
- Find templates where Last Used Date > 180 days ago
- Set Status to "Archived"
- Send archive report

---

## Additional Table: Send History (Optional)

**Note**: This table can mirror the Google Sheets "Send History Log" for quick lookups, but it's optional since Google Sheets serves as the primary audit trail.

If implemented, it would have similar fields to Sheet 2 with links to Contacts, Campaigns, and Brands.

---

## Setup Instructions

### 1. Create Airtable Base

```
1. Go to airtable.com
2. Create new base: "Multi-Brand Email Automation"
3. Delete default table
4. Create 5 tables as specified above
```

### 2. Configure Fields

For each table:
1. Add all fields with correct types
2. Configure link relationships
3. Set up formulas and rollups
4. Apply conditional formatting

### 3. Create Views

Create the specified views for each table with appropriate filters, sorts, and grouping.

### 4. Set Up Automations

Configure the automations as specified for each table.

### 5. Configure Permissions

```
Workspace collaborators:
- Admins: Creator
- Campaign Managers: Editor
- n8n Service Account: Editor (via API key)
- Viewers: Read-only
```

### 6. Generate API Key

```
1. Go to airtable.com/account
2. Generate new personal access token
3. Scope: data.records:read, data.records:write
4. Add to .env file
```

### 7. Get Base and Table IDs

```
Base ID: From URL https://airtable.com/[BASE_ID]/...
Table IDs: API documentation page for your base
```

---

## Relationship Diagram

```
Brands ─┬─→ Contacts (Primary Brand, Associated Brands)
        ├─→ Campaigns (Brand)
        ├─→ Campaign Queue (Brand)
        └─→ Templates (Brand)

Contacts ─┬─→ Campaigns (Target Contacts)
          ├─→ Campaign Queue (Contact)
          └─→ Send History (Contact)

Campaigns ─┬─→ Campaign Queue (Campaign)
           ├─→ Templates (Template)
           └─→ Send History (Campaign)

Templates ─┬─→ Campaigns (Template)
           └─→ Campaign Queue (Template)

Campaign Queue ─→ Send History (creates history record)
```

---

## Sync Strategy with Google Sheets

### Hourly Sync (n8n WF1)

**Direction**: Bidirectional

**Google Sheets → Airtable**:
- Contacts: All fields except auto-calculated
- Brands: All configuration fields
- Templates: Template content and metadata

**Airtable → Google Sheets**:
- Campaign performance metrics
- Queue status updates
- Engagement calculations

**Conflict Resolution**:
- Last-write-wins for most fields
- Google Sheets is source of truth for contacts
- Airtable is source of truth for campaigns

### Field Mapping

| Google Sheets Column | Airtable Field | Sync Direction |
|---------------------|----------------|----------------|
| Contact ID | Contact ID | Both |
| Email | Email | GS → AT |
| Lead Status | Lead Status | Both |
| Lead Score | Lead Score | Both |
| Total Emails Sent | Total Emails Sent | AT → GS |
| Engagement Score | Engagement Score | AT → GS |
| Last Contacted Date | Last Contacted Date | AT → GS |

---

## Best Practices

### Data Management
- Use linked records instead of duplicating data
- Leverage rollups for aggregate calculations
- Create views for common queries instead of filters

### Performance
- Limit linked record fields to necessary relationships
- Use selective syncing (only changed records)
- Archive old campaigns and queue entries

### Automation
- Keep automations simple and focused
- Test thoroughly before enabling
- Monitor automation run history for errors

### Security
- Use personal access tokens with minimal scopes
- Rotate API keys quarterly
- Audit permissions monthly

### Collaboration
- Document custom workflows in the base
- Use comments for field explanations
- Create interface layouts for non-technical users

---

**Document Version**: 1.0
**Last Updated**: 2025-10-22
**Next Review**: Monthly
