# Google Sheets Schema Documentation

## Overview

Google Sheets serves as the **master source of truth** for the Multi-Brand Email Automation System. It provides easy manual access, robust API support, and serves as the primary data store that syncs to Airtable.

**Spreadsheet Structure**: 5 sheets in a single Google Sheets workbook

---

## Sheet 1: Ultimate Contact Sheet

### Purpose
Master contact database containing all contact information, engagement metrics, and email frequency tracking.

### Column Schema

| Column | Data Type | Required | Description | Example |
|--------|-----------|----------|-------------|---------|
| Contact ID | Text | Yes | Unique identifier | `CONT-2024-00001` |
| First Name | Text | Yes | Contact's first name | `John` |
| Last Name | Text | Yes | Contact's last name | `Smith` |
| Email | Email | Yes | Primary email address | `john.smith@example.com` |
| Phone | Text | No | Phone number with country code | `+1-555-123-4567` |
| Company | Text | No | Company name | `Tech Corp` |
| Job Title | Text | No | Current position | `CTO` |
| Lead Status | Dropdown | Yes | Current lead status | `Hot`, `Warm`, `Cold`, `Inactive` |
| Lead Score | Number | Yes | Score from 0-10 | `8` |
| Visa Type | Dropdown | No | Target visa category | `O1`, `EB1`, `EB2`, `L1`, `E2`, `P1` |
| Visa Status | Dropdown | No | Current visa status | `Initial`, `In Progress`, `Approved`, `Denied` |
| Country of Origin | Text | No | Nationality | `United Kingdom` |
| Current Location | Text | No | Current city/state | `New York, NY` |
| Associated Brands | Multi-Select | Yes | Brands contact is associated with | `Sherrod Sports, IGT` |
| Primary Brand | Dropdown | Yes | Main brand managing contact | `Sherrod Sports Visas` |
| Opt-Out Status | Dropdown | Yes | Email opt-out status | `Active`, `Opt-Out Global`, `Opt-Out Brand` |
| Opt-Out Date | Date | No | Date of opt-out | `2024-01-15` |
| Opt-Out Reason | Text | No | Reason for opt-out | `Too many emails` |
| Total Emails Sent | Number | Auto | Lifetime email count | `47` |
| Emails Sent 24h | Number | Auto | Emails in last 24 hours | `0` |
| Emails Sent 7d | Number | Auto | Emails in last 7 days | `2` |
| Emails Sent 30d | Number | Auto | Emails in last 30 days | `8` |
| Total Emails Opened | Number | Auto | Lifetime opens | `32` |
| Total Emails Clicked | Number | Auto | Lifetime clicks | `15` |
| Total Emails Replied | Number | Auto | Lifetime replies | `8` |
| Last Opened Date | DateTime | Auto | Most recent open | `2024-10-20 14:35:00` |
| Last Clicked Date | DateTime | Auto | Most recent click | `2024-10-18 09:22:00` |
| Last Replied Date | DateTime | Auto | Most recent reply | `2024-10-19 16:45:00` |
| Last Contacted Date | DateTime | Auto | Most recent email sent | `2024-10-20 10:00:00` |
| First Contact Date | DateTime | Auto | Initial email sent | `2024-01-05 11:20:00` |
| Engagement Score | Number | Auto | Calculated 0-100 | `75` |
| Engagement Tier | Dropdown | Auto | Engagement category | `High`, `Medium`, `Low`, `None` |
| Days Since Contact | Number | Auto | Days since last email | `2` |
| Campaign Count | Number | Auto | Total campaigns participated | `12` |
| Last Campaign ID | Text | Auto | Most recent campaign | `CAMP-2024-0234` |
| Last Campaign Date | Date | Auto | Last campaign date | `2024-10-20` |
| Source | Dropdown | No | Lead source | `Website`, `Referral`, `LinkedIn`, `Event` |
| Source Date | Date | No | Date added to system | `2024-01-05` |
| Referred By | Text | No | Referrer name | `Jane Doe` |
| Tags | Multi-Select | No | Custom tags | `Hot Lead`, `Athlete`, `Tech` |
| Notes | Long Text | No | Internal notes | `Very interested, follow up next week` |
| Last Modified | DateTime | Auto | Last update timestamp | `2024-10-22 08:15:00` |
| Created Date | DateTime | Auto | Record creation date | `2024-01-05 09:30:00` |
| Created By | Text | Auto | User who created record | `admin@system.com` |

### Formulas & Auto-Calculations

#### Emails Sent 24h
```javascript
=COUNTIFS('Send History Log'!$C:$C, A2, 'Send History Log'!$H:$H, ">="&NOW()-1)
```

#### Emails Sent 7d
```javascript
=COUNTIFS('Send History Log'!$C:$C, A2, 'Send History Log'!$H:$H, ">="&NOW()-7)
```

#### Emails Sent 30d
```javascript
=COUNTIFS('Send History Log'!$C:$C, A2, 'Send History Log'!$H:$H, ">="&NOW()-30)
```

#### Engagement Score
```javascript
=(
  (O2/N2)*40 +          // Open rate * 40%
  (P2/N2)*40 +          // Click rate * 40%
  (Q2/N2)*20            // Reply rate * 20%
)*100
```

#### Engagement Tier
```javascript
=IF(W2>=80,"High",IF(W2>=50,"Medium",IF(W2>=20,"Low","None")))
```

#### Days Since Contact
```javascript
=IF(V2="","",NOW()-V2)
```

### Data Validation Rules

| Column | Validation Type | Values |
|--------|----------------|--------|
| Email | Email format | Must be valid email |
| Lead Status | Dropdown | Hot, Warm, Cold, Inactive |
| Lead Score | Number | 0-10 |
| Visa Type | Dropdown | O1, EB1, EB2, EB3, L1, E2, P1, H1B, Other |
| Opt-Out Status | Dropdown | Active, Opt-Out Global, Opt-Out Brand |
| Engagement Tier | Dropdown | High, Medium, Low, None |
| Source | Dropdown | Website, Referral, LinkedIn, Event, Cold Outreach, Partner |

### Conditional Formatting

| Condition | Format | Purpose |
|-----------|--------|---------|
| Lead Status = "Hot" | Red background | Highlight hot leads |
| Lead Status = "Warm" | Orange background | Highlight warm leads |
| Lead Status = "Cold" | Blue background | Highlight cold leads |
| Opt-Out Status ≠ "Active" | Gray strikethrough | Mark opted-out contacts |
| Emails Sent 24h >= 1 | Yellow border | Frequency warning |
| Engagement Score >= 80 | Green text | High engagement |
| Engagement Score < 20 | Red text | Low engagement |
| Days Since Contact > 30 | Orange background | Follow-up needed |

---

## Sheet 2: Send History Log

### Purpose
Complete audit trail of all emails sent, including delivery status, engagement events, and errors.

### Column Schema

| Column | Data Type | Required | Description | Example |
|--------|-----------|----------|-------------|---------|
| Queue ID | Text | Yes | Unique send identifier | `QUEUE-2024-12345` |
| Campaign ID | Text | Yes | Associated campaign | `CAMP-2024-0234` |
| Contact ID | Text | Yes | Recipient contact ID | `CONT-2024-00001` |
| Contact Email | Email | Yes | Recipient email | `john.smith@example.com` |
| Contact Name | Text | Yes | Recipient full name | `John Smith` |
| Brand ID | Text | Yes | Sending brand | `sherrod-sports-visas` |
| Brand Name | Text | Yes | Brand display name | `Sherrod Sports Visas` |
| From Email | Email | Yes | Sender email | `contact@sherrodsportsvisas.com` |
| From Name | Text | Yes | Sender display name | `Sherrod Sports Visas` |
| Reply-To | Email | Yes | Reply-to address | `support@sherrodsportsvisas.com` |
| Subject | Text | Yes | Email subject line | `Next Steps for Your O1 Visa Application` |
| Body Preview | Text | No | First 100 chars of body | `Hi John, I wanted to follow up...` |
| Body Full | Long Text | Yes | Complete email HTML | `<html>...</html>` |
| Template ID | Text | No | Template used (if any) | `TMPL-sports-followup-v2` |
| Generation Method | Dropdown | Yes | How email was created | `Claude AI`, `Template`, `Manual` |
| Message Type | Dropdown | Yes | Campaign type | `Promotional`, `Follow-Up`, `Transactional` |
| Tracking Pixel URL | URL | Yes | Open tracking URL | `https://track.domain.com/pixel/QUEUE-2024-12345` |
| Tracking Links | Long Text | No | Click tracking URLs (JSON) | `{"link1": "...", "link2": "..."}` |
| Status | Dropdown | Yes | Send status | `Pending`, `Sent`, `Failed`, `Bounced` |
| Scheduled For | DateTime | Yes | When to send | `2024-10-22 10:00:00` |
| Sent At | DateTime | Auto | Actual send time | `2024-10-22 10:00:15` |
| Delivered At | DateTime | Auto | Delivery confirmation | `2024-10-22 10:00:45` |
| Opened | Boolean | Auto | Email opened | `TRUE` |
| Opened At | DateTime | Auto | First open time | `2024-10-22 14:35:00` |
| Open Count | Number | Auto | Total opens | `3` |
| Last Opened At | DateTime | Auto | Most recent open | `2024-10-23 09:20:00` |
| Clicked | Boolean | Auto | Link clicked | `TRUE` |
| Clicked At | DateTime | Auto | First click time | `2024-10-22 14:36:00` |
| Click Count | Number | Auto | Total clicks | `2` |
| Last Clicked At | DateTime | Auto | Most recent click | `2024-10-22 16:45:00` |
| Replied | Boolean | Auto | Reply received | `FALSE` |
| Replied At | DateTime | Auto | Reply time | `` |
| Bounced | Boolean | Auto | Email bounced | `FALSE` |
| Bounce Type | Dropdown | Auto | Bounce category | ``, `Hard`, `Soft` |
| Bounce Reason | Text | Auto | Bounce detail | `` |
| Spam Complaint | Boolean | Auto | Marked as spam | `FALSE` |
| Unsubscribed | Boolean | Auto | Unsubscribe click | `FALSE` |
| Unsubscribed At | DateTime | Auto | Unsub time | `` |
| Error Message | Text | Auto | Error details (if failed) | `` |
| Retry Count | Number | Auto | Send retry attempts | `0` |
| Last Retry At | DateTime | Auto | Last retry time | `` |
| Lido Row ID | Text | Auto | Lido sheet row reference | `234` |
| Processing Time MS | Number | Auto | Generation time | `1250` |
| Cost Estimate | Number | Auto | Estimated cost (AI) | `0.003` |
| Created At | DateTime | Auto | Record creation | `2024-10-22 09:55:00` |
| Updated At | DateTime | Auto | Last update | `2024-10-23 09:20:00` |

### Data Validation

| Column | Validation | Values |
|--------|-----------|--------|
| Status | Dropdown | Pending, Sent, Failed, Bounced, Scheduled |
| Generation Method | Dropdown | Claude AI, Template, Manual |
| Message Type | Dropdown | Promotional, Follow-Up, Transactional, Educational |
| Bounce Type | Dropdown | Hard, Soft |

### Formulas

#### Open Rate (by campaign)
```javascript
=COUNTIF(AA:AA,TRUE)/COUNTA(A:A)
```

#### Click Rate (by campaign)
```javascript
=COUNTIF(AG:AG,TRUE)/COUNTA(A:A)
```

---

## Sheet 3: Brand Configuration

### Purpose
Store brand settings, voice guidelines, and sending configurations.

### Column Schema

| Column | Data Type | Required | Description | Example |
|--------|-----------|----------|-------------|---------|
| Brand ID | Text | Yes | Unique brand identifier | `sherrod-sports-visas` |
| Brand Name | Text | Yes | Display name | `Sherrod Sports Visas` |
| Brand Short Name | Text | No | Abbreviated name | `Sherrod` |
| Email | Email | Yes | Primary sending email | `contact@sherrodsportsvisas.com` |
| From Name | Text | Yes | Sender display name | `Sherrod Sports Visas` |
| Reply-To Email | Email | Yes | Reply address | `support@sherrodsportsvisas.com` |
| Workspace ID | Text | Yes | Google Workspace | `workspace-sherrod` |
| Workspace Email | Email | Yes | Workspace account | `contact@sherrodsportsvisas.com` |
| Sending Domain | Text | Yes | Email domain | `sherrodsportsvisas.com` |
| Voice Tone | Text | Yes | Communication tone | `Professional, authoritative, sports-focused` |
| Voice Style | Text | Yes | Writing style | `Direct and action-oriented` |
| Voice Personality | Text | Yes | Brand personality | `Expert consultant` |
| Key Phrases | Long Text | No | Preferred phrases (comma-separated) | `sports visa expertise, athlete immigration` |
| Avoid Phrases | Long Text | No | Phrases to avoid | `maybe, hopefully, try, might` |
| Signature | Long Text | Yes | Email signature | `Best regards,\n\nSherrod Sports Visas Team` |
| Default Template ID | Text | No | Default template | `TMPL-sherrod-intro-v1` |
| Website URL | URL | Yes | Primary website | `https://www.sherrodsportsvisas.com` |
| Logo URL | URL | No | Brand logo | `https://cdn.sherrodsportsvisas.com/logo.png` |
| Primary Color | Text | No | Brand hex color | `#1E40AF` |
| Secondary Color | Text | No | Secondary hex color | `#F59E0B` |
| Payment Link | URL | No | Payment portal | `https://sherrodsportsvisas.com/payment` |
| Calendly Link | URL | No | Scheduling link | `https://calendly.com/sherrod-sports` |
| StreamYard Link | URL | No | Video call link | `https://streamyard.com/sherrod` |
| Custom Field 1 Name | Text | No | Custom field label | `Consultation Type` |
| Custom Field 1 Value | Text | No | Custom field value | `Sports Visa` |
| Custom Field 2 Name | Text | No | Custom field label | `` |
| Custom Field 2 Value | Text | No | Custom field value | `` |
| Daily Send Limit | Number | Yes | Max emails per day | `500` |
| Hourly Send Limit | Number | Yes | Max emails per hour | `50` |
| Current Daily Sent | Number | Auto | Today's sent count | `127` |
| Current Hourly Sent | Number | Auto | This hour's sent count | `12` |
| Limit Reset Time | DateTime | Auto | Daily counter reset | `2024-10-23 00:00:00` |
| Status | Dropdown | Yes | Brand active status | `Active`, `Paused`, `Disabled` |
| Tags | Multi-Select | No | Brand categorization | `Sports, Visas, O1, P1` |
| SPF Record | Text | No | Email auth | `v=spf1 include:_spf.google.com ~all` |
| DKIM Selector | Text | No | DKIM selector | `google` |
| DMARC Policy | Text | No | DMARC policy | `p=quarantine` |
| Created Date | DateTime | Auto | Brand creation date | `2024-01-01 10:00:00` |
| Updated Date | DateTime | Auto | Last update | `2024-10-22 08:30:00` |
| Created By | Text | Auto | Creator | `admin@system.com` |

### Formulas

#### Current Daily Sent (resets at midnight)
```javascript
=COUNTIFS('Send History Log'!$G:$G,A2,'Send History Log'!$AB:$AB,">=0+"&INT(NOW()))
```

#### Current Hourly Sent
```javascript
=COUNTIFS('Send History Log'!$G:$G,A2,'Send History Log'!$AB:$AB,">="&NOW()-1/24)
```

---

## Sheet 4: Template Library

### Purpose
Store reusable email templates with performance tracking and versioning.

### Column Schema

| Column | Data Type | Required | Description | Example |
|--------|-----------|----------|-------------|---------|
| Template ID | Text | Yes | Unique identifier | `TMPL-sherrod-intro-v1` |
| Template Name | Text | Yes | Display name | `Sherrod Sports - Introduction Email` |
| Brand ID | Text | Yes | Associated brand | `sherrod-sports-visas` |
| Brand Name | Text | Yes | Brand display name | `Sherrod Sports Visas` |
| Category | Dropdown | Yes | Template type | `Introduction`, `Follow-Up`, `Reminder` |
| Subject Template | Text | Yes | Subject with variables | `{{firstName}}, Ready for Your {{visaType}} Journey?` |
| Body Template | Long Text | Yes | Email body with variables | `Hi {{firstName}},\n\nI wanted to reach out...` |
| Variables | Text | Yes | Required variables (comma-separated) | `firstName, lastName, visaType` |
| Tone | Dropdown | Yes | Communication tone | `Professional`, `Casual`, `Urgent` |
| Version | Text | Yes | Version number | `1.0` |
| Previous Version ID | Text | No | Previous template version | `TMPL-sherrod-intro-v0` |
| Status | Dropdown | Yes | Template status | `Active`, `Draft`, `Archived` |
| Use Case | Text | No | When to use | `Initial outreach to sports professionals` |
| Target Lead Status | Multi-Select | No | Ideal for lead types | `Hot, Warm` |
| Target Visa Types | Multi-Select | No | Visa categories | `O1, P1` |
| Preview Text | Text | No | Email preview/preheader | `Let's discuss your visa options` |
| Times Used | Number | Auto | Total usage count | `247` |
| Last Used Date | DateTime | Auto | Most recent use | `2024-10-22 15:30:00` |
| Total Sent | Number | Auto | Total sends | `247` |
| Total Opened | Number | Auto | Total opens | `186` |
| Total Clicked | Number | Auto | Total clicks | `92` |
| Total Replied | Number | Auto | Total replies | `38` |
| Open Rate | Percentage | Auto | Opens / Sent | `75.3%` |
| Click Rate | Percentage | Auto | Clicks / Sent | `37.2%` |
| Reply Rate | Percentage | Auto | Replies / Sent | `15.4%` |
| Avg Response Time Hours | Number | Auto | Average reply time | `18.5` |
| Performance Score | Number | Auto | Weighted performance 0-100 | `82` |
| A/B Test Group | Text | No | Test identifier | `A` |
| A/B Test Status | Dropdown | No | Test status | `Active`, `Winner`, `Loser` |
| Tags | Multi-Select | No | Template tags | `Sports, Introduction, High-Performing` |
| Notes | Long Text | No | Internal notes | `Best performer Q3 2024` |
| Created Date | DateTime | Auto | Creation date | `2024-03-15 10:00:00` |
| Updated Date | DateTime | Auto | Last modification | `2024-10-01 14:20:00` |
| Created By | Text | Auto | Creator | `admin@system.com` |

### Formulas

#### Open Rate
```javascript
=IF(V2=0,0,(W2/V2))
```

#### Click Rate
```javascript
=IF(V2=0,0,(X2/V2))
```

#### Reply Rate
```javascript
=IF(V2=0,0,(Y2/V2))
```

#### Performance Score
```javascript
=(Z2*40)+(AA2*40)+(AB2*20)
```

---

## Sheet 5: Campaign Queue

### Purpose
Active campaign queue for scheduling and tracking email sends.

### Column Schema

| Column | Data Type | Required | Description | Example |
|--------|-----------|----------|-------------|---------|
| Queue ID | Text | Yes | Unique queue entry | `QUEUE-2024-12345` |
| Campaign ID | Text | Yes | Parent campaign | `CAMP-2024-0234` |
| Campaign Name | Text | Yes | Campaign display name | `October Sports Visa Follow-Up` |
| Contact ID | Text | Yes | Recipient | `CONT-2024-00001` |
| Contact Email | Email | Yes | Recipient email | `john.smith@example.com` |
| Contact Name | Text | Yes | Recipient name | `John Smith` |
| Brand ID | Text | Yes | Sending brand | `sherrod-sports-visas` |
| Brand Name | Text | Yes | Brand name | `Sherrod Sports Visas` |
| Subject | Text | Yes | Email subject | `Next Steps for Your O1 Application` |
| Body | Long Text | Yes | Email body (HTML) | `<html>...</html>` |
| Template ID | Text | No | Template used | `TMPL-sherrod-followup-v2` |
| Generation Method | Dropdown | Yes | Creation method | `Claude AI`, `Template`, `Manual` |
| Status | Dropdown | Yes | Queue status | `Pending`, `Ready`, `Sending`, `Sent`, `Failed` |
| Priority | Dropdown | Yes | Send priority | `High`, `Normal`, `Low` |
| Scheduled For | DateTime | Yes | When to send | `2024-10-23 10:00:00` |
| Created At | DateTime | Auto | Queue entry created | `2024-10-22 16:00:00` |
| Validated At | DateTime | Auto | Frequency check passed | `2024-10-22 16:00:05` |
| Started Sending At | DateTime | Auto | Send initiated | `2024-10-23 10:00:00` |
| Completed At | DateTime | Auto | Send completed | `2024-10-23 10:00:15` |
| Error Message | Text | Auto | Error details (if any) | `` |
| Retry Count | Number | Auto | Retry attempts | `0` |
| Next Retry At | DateTime | Auto | Next retry time | `` |
| Lido Row ID | Text | Auto | Lido reference | `456` |
| Frequency Check 24h | Boolean | Auto | 24h limit passed | `TRUE` |
| Frequency Check 7d | Boolean | Auto | 7d limit passed | `TRUE` |
| Frequency Check 30d | Boolean | Auto | 30d limit passed | `TRUE` |
| Frequency Warnings | Text | Auto | Warning messages | `` |
| Validation Passed | Boolean | Auto | All checks passed | `TRUE` |
| Tracking Pixel URL | URL | Auto | Open tracker | `https://track.domain.com/pixel/QUEUE-2024-12345` |
| Updated At | DateTime | Auto | Last update | `2024-10-23 10:00:15` |

### Status Flow
```
Pending → Ready → Sending → Sent → Completed
                         ↓
                      Failed → [Retry] → Pending
```

---

## Setup Instructions

### 1. Create New Google Spreadsheet

```
1. Go to sheets.google.com
2. Create new spreadsheet
3. Name it "Multi-Brand Email Automation - Master Data"
4. Share with service account: n8n-service@project.iam.gserviceaccount.com
```

### 2. Create Sheets

Create 5 sheets with the names above and add column headers as specified.

### 3. Apply Data Validation

For each dropdown field, apply data validation:
```
Data → Data validation → List from a range or List of items
```

### 4. Apply Conditional Formatting

Apply the conditional formatting rules specified for each sheet.

### 5. Set Up Formulas

Add the auto-calculation formulas to the appropriate columns.

### 6. Configure Permissions

```
Share settings:
- n8n Service Account: Editor
- Admin Users: Editor
- Campaign Managers: Editor
- Viewers: View only
```

### 7. Get Sheet ID

```
From URL: https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
Copy the SHEET_ID and add to .env file
```

---

## Best Practices

### Data Entry
- Use data validation to prevent errors
- Keep Contact ID format consistent
- Update timestamps automatically via formulas
- Never manually edit auto-calculated fields

### Performance
- Keep each sheet under 50,000 rows for optimal performance
- Archive old Send History Log entries (>90 days) monthly
- Use filters and views instead of hiding rows

### Backup
- Enable version history
- Export to CSV weekly
- Store backups in Google Drive folder

### Security
- Limit editor access to trusted users
- Use service accounts for API access
- Never store API keys in sheets
- Regularly audit share permissions

---

**Document Version**: 1.0
**Last Updated**: 2025-10-22
**Next Review**: Monthly
