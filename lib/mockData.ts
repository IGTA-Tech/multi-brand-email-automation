import { Brand, Contact, EmailTemplate, Campaign, SendHistoryEntry } from './types';

export const MOCK_BRANDS: Brand[] = [
  {
    id: 'BRD-001',
    name: 'Sherrod Sports Visas',
    sendingEmail: 'hello@sherrodsportsvisas.com',
    replyToEmail: 'hello@sherrodsportsvisas.com',
    senderName: 'Sherrod Sports Visas Team',
    signatureHTML: '<p>Best regards,<br/>Sherrod Sports Visas Team<br/><a href="https://sherrodsportsvisas.com">sherrodsportsvisas.com</a></p>',
    voiceGuidelines: 'Professional yet warm. We work with elite athletes worldwide. Tone: Encouraging, knowledgeable, never pushy. Use sports metaphors occasionally. Focus on achieving dreams and making impact.',
    active: true,
    maxSendsPerDay: 500,
    associatedWorkspace: 'workspace1@acmevisa.com',
    color: '#3B82F6'
  },
  {
    id: 'BRD-002',
    name: 'Aventus Visa Agents',
    sendingEmail: 'contact@aventusvisaagents.com',
    replyToEmail: 'contact@aventusvisaagents.com',
    senderName: 'Aventus Visa Team',
    signatureHTML: '<p>Warm regards,<br/>Aventus Visa Agents<br/><a href="https://aventusvisaagents.com">aventusvisaagents.com</a></p>',
    voiceGuidelines: 'Approachable and supportive. We simplify complex immigration. Tone: Warm, helpful, confidence-inspiring. Address contacts by first name. Focus on outcomes and peace of mind.',
    active: true,
    maxSendsPerDay: 400,
    associatedWorkspace: 'workspace2@acmevisa.com',
    color: '#10B981'
  },
  {
    id: 'BRD-003',
    name: 'O&P Visas Community',
    sendingEmail: 'info@oandpvisas.community',
    replyToEmail: 'info@oandpvisas.community',
    senderName: 'O&P Visas Team',
    signatureHTML: '<p>Creatively yours,<br/>O&P Visas Community<br/><a href="https://oandpvisas.community">oandpvisas.community</a></p>',
    voiceGuidelines: 'Creative and supportive. We champion artists and performers. Tone: Inspiring, understanding, community-focused. Celebrate their art. Show understanding of creative industry challenges.',
    active: true,
    maxSendsPerDay: 300,
    associatedWorkspace: 'workspace3@acmevisa.com',
    color: '#8B5CF6'
  }
];

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'C-001',
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'marcus.j@example.com',
    company: 'Elite Athletics',
    sourceAccount: 'workspace1@acmevisa.com',
    associatedBrands: ['BRD-001'],
    leadStatus: 'Hot Lead',
    leadScore: 9,
    visaType: 'O-1A',
    lastContactedDate: '2025-10-10',
    totalEmailsSent: 2,
    last7DaysCount: 1,
    last24HoursCount: 0,
    last30DaysCount: 2,
    engagementScore: 85,
    openRate: 75,
    clickRate: 50,
    lastOpenedDate: '2025-10-10',
    optedOut: false,
    optedOutBrands: [],
    tags: ['athlete', 'basketball']
  },
  {
    id: 'C-002',
    firstName: 'Sofia',
    lastName: 'Martinez',
    email: 'sofia.m@example.com',
    company: 'Dance Productions Inc',
    sourceAccount: 'workspace2@acmevisa.com',
    associatedBrands: ['BRD-002', 'BRD-003'],
    leadStatus: 'Warm Lead',
    leadScore: 7,
    visaType: 'P-1A',
    lastContactedDate: '2025-10-16',
    totalEmailsSent: 5,
    last7DaysCount: 2,
    last24HoursCount: 1,
    last30DaysCount: 4,
    engagementScore: 60,
    openRate: 60,
    clickRate: 30,
    lastOpenedDate: '2025-10-16',
    optedOut: false,
    optedOutBrands: [],
    tags: ['performer', 'dance']
  },
  {
    id: 'C-003',
    firstName: 'David',
    lastName: 'Chen',
    email: 'david.c@example.com',
    company: 'Tech Innovations Ltd',
    sourceAccount: 'workspace1@acmevisa.com',
    associatedBrands: ['BRD-001'],
    leadStatus: 'Cold Lead',
    leadScore: 4,
    visaType: 'EB-1A',
    lastContactedDate: '2025-10-05',
    totalEmailsSent: 8,
    last7DaysCount: 3,
    last24HoursCount: 0,
    last30DaysCount: 6,
    engagementScore: 25,
    openRate: 30,
    clickRate: 10,
    optedOut: false,
    optedOutBrands: [],
    tags: ['tech', 'executive']
  },
  {
    id: 'C-004',
    firstName: 'Emma',
    lastName: 'Williams',
    email: 'emma.w@example.com',
    company: 'Broadway Productions',
    sourceAccount: 'workspace3@acmevisa.com',
    associatedBrands: ['BRD-003'],
    leadStatus: 'Hot Lead',
    leadScore: 10,
    visaType: 'O-1B',
    lastContactedDate: '2025-10-08',
    totalEmailsSent: 1,
    last7DaysCount: 0,
    last24HoursCount: 0,
    last30DaysCount: 1,
    engagementScore: 90,
    openRate: 100,
    clickRate: 100,
    optedOut: false,
    optedOutBrands: [],
    tags: ['artist', 'theater']
  },
  {
    id: 'C-005',
    firstName: 'James',
    lastName: 'Rodriguez',
    email: 'james.r@example.com',
    company: 'Pro Soccer Academy',
    sourceAccount: 'workspace1@acmevisa.com',
    associatedBrands: ['BRD-001'],
    leadStatus: 'Warm Lead',
    leadScore: 8,
    visaType: 'P-1A',
    lastContactedDate: '2025-10-12',
    totalEmailsSent: 3,
    last7DaysCount: 1,
    last24HoursCount: 0,
    last30DaysCount: 3,
    engagementScore: 70,
    openRate: 66,
    clickRate: 33,
    optedOut: false,
    optedOutBrands: [],
    tags: ['athlete', 'soccer']
  },
  {
    id: 'C-006',
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.p@example.com',
    company: 'Classical Music Ensemble',
    sourceAccount: 'workspace3@acmevisa.com',
    associatedBrands: ['BRD-003'],
    leadStatus: 'Hot Lead',
    leadScore: 9,
    visaType: 'O-1B',
    lastContactedDate: '2025-10-14',
    totalEmailsSent: 2,
    last7DaysCount: 1,
    last24HoursCount: 0,
    last30DaysCount: 2,
    engagementScore: 80,
    openRate: 100,
    clickRate: 50,
    optedOut: false,
    optedOutBrands: [],
    tags: ['musician', 'classical']
  }
];

export const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: 'T-001',
    name: 'Hot Lead Follow-up - Athletes',
    brandId: 'BRD-001',
    category: 'Follow-up',
    subject: 'Hi {firstName}, your {visaType} next steps',
    body: `Hi {firstName},

I hope this finds you well. I wanted to follow up on your {visaType} inquiry.

It's been {daysSinceContact} days since we last connected. Here's what I can help with:

• Free case evaluation
• Timeline overview for {visaType}
• Answer any questions

Your athletic achievements position you perfectly for the {visaType}. Let's get you on track to achieving your goals in the United States.

Reply to this email or schedule a call: https://calendly.com/sherrodsports

{signature}`,
    variablesUsed: ['firstName', 'visaType', 'daysSinceContact', 'signature'],
    useCase: 'Hot leads who haven\'t responded in 7-14 days',
    performanceScore: 85,
    timesUsed: 24,
    avgOpenRate: 72,
    avgClickRate: 45,
    active: true
  },
  {
    id: 'T-002',
    name: 'Cold Lead Re-engagement - Artists',
    brandId: 'BRD-003',
    category: 'Re-engagement',
    subject: 'Quick check-in about your {visaType}',
    body: `Hi {firstName},

I haven't heard back in a while and wanted to check in.

As a {visaType} specialist working with artists and performers, I know the visa process can feel overwhelming. If you're still interested, I'm here to make it simple.

No pressure—just letting you know the door is open whenever you're ready.

We've helped over 200 artists like yourself achieve their American dream.

Best,
{signature}`,
    variablesUsed: ['firstName', 'visaType', 'signature'],
    useCase: 'Cold leads who went silent, gentle re-engagement',
    performanceScore: 62,
    timesUsed: 15,
    avgOpenRate: 45,
    avgClickRate: 20,
    active: true
  },
  {
    id: 'T-003',
    name: 'Warm Lead Nurture - General',
    brandId: 'BRD-002',
    category: 'Nurture',
    subject: '{firstName}, here\'s what you need to know about {visaType}',
    body: `Hi {firstName},

Thanks for your interest in the {visaType} visa process!

I wanted to share some key information that might help:

✓ **Timeline**: Typically 4-8 months for {visaType}
✓ **Requirements**: We'll help you gather everything needed
✓ **Success Rate**: 95% approval rate with our guidance

Your profile shows strong potential for approval. Let's discuss your specific situation.

Would you like to schedule a free 15-minute consultation?

Warm regards,
{signature}`,
    variablesUsed: ['firstName', 'visaType', 'signature'],
    useCase: 'Warm leads who need more information',
    performanceScore: 78,
    timesUsed: 32,
    avgOpenRate: 65,
    avgClickRate: 38,
    active: true
  }
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'C-042',
    name: 'Hot O-1A Athletes Follow-up',
    brandId: 'BRD-001',
    brandName: 'Sherrod Sports Visas',
    status: 'sending',
    deliveryMode: 'immediate',
    totalContacts: 45,
    sentCount: 32,
    openCount: 18,
    clickCount: 9,
    openRate: 56.25,
    clickRate: 28.13,
    createdAt: '2025-10-17T09:00:00Z',
    createdBy: 'admin@acmevisa.com',
    templateId: 'T-001'
  },
  {
    id: 'C-041',
    name: 'Artist Re-engagement Campaign',
    brandId: 'BRD-003',
    brandName: 'O&P Visas Community',
    status: 'completed',
    deliveryMode: 'scheduled',
    totalContacts: 67,
    sentCount: 67,
    openCount: 28,
    clickCount: 12,
    openRate: 41.79,
    clickRate: 17.91,
    scheduledFor: '2025-10-15T10:00:00Z',
    createdAt: '2025-10-14T16:00:00Z',
    createdBy: 'admin@acmevisa.com',
    templateId: 'T-002'
  }
];

export const MOCK_SEND_HISTORY: SendHistoryEntry[] = [
  {
    id: 'S-001',
    contactId: 'C-002',
    contactEmail: 'sofia.m@example.com',
    campaignId: 'C-042',
    campaignName: 'Hot O-1A Athletes Follow-up',
    brand: 'Aventus Visa Agents',
    sendingAccount: 'workspace2@acmevisa.com',
    subject: 'Sofia, your P-1A next steps',
    scheduledSendTime: '2025-10-17T10:15:00Z',
    actualSendTime: '2025-10-17T10:16:23Z',
    sendStatus: 'sent',
    opened: true,
    openedAt: '2025-10-17T14:32:15Z',
    clicked: false
  }
];
