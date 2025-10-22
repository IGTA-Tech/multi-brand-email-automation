// Core Types for Multi-Brand Email Automation System

export interface Brand {
  id: string;
  name: string;
  sendingEmail: string;
  replyToEmail: string;
  senderName: string;
  signatureHTML: string;
  voiceGuidelines: string;
  active: boolean;
  maxSendsPerDay: number;
  associatedWorkspace: string;
  color: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  sourceAccount: string;
  associatedBrands: string[];
  leadStatus: 'Hot Lead' | 'Warm Lead' | 'Cold Lead' | 'Current Client' | 'Not Interested';
  leadScore: number; // 1-10
  visaType: string;
  lastContactedDate?: string;
  lastContactedByBrand?: string;
  totalEmailsSent: number;
  last7DaysCount: number;
  last24HoursCount: number;
  last30DaysCount: number;
  engagementScore: number; // 0-100
  openRate: number;
  clickRate: number;
  lastOpenedDate?: string;
  optedOut: boolean;
  optedOutBrands: string[];
  tags: string[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  brandId: string;
  category: 'Follow-up' | 'Nurture' | 'Announcement' | 'Re-engagement' | 'Cold Outreach';
  subject: string;
  body: string;
  variablesUsed: string[];
  useCase: string;
  performanceScore: number;
  timesUsed: number;
  avgOpenRate: number;
  avgClickRate: number;
  active: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  status: 'draft' | 'ready' | 'sending' | 'completed' | 'paused' | 'failed';
  deliveryMode: 'immediate' | 'scheduled' | 'recurring' | 'autopilot';
  totalContacts: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
  openRate: number;
  clickRate: number;
  scheduledFor?: string;
  createdAt: string;
  createdBy: string;
  templateId?: string;
  targetCriteria?: TargetCriteria;
}

export interface TargetCriteria {
  leadStatus: string[];
  visaTypes: string[];
  daysSinceContact: {
    min: number;
    max: number;
  };
  engagementLevel: 'hot' | 'warm' | 'cold';
  leadScoreMin: number;
}

export interface QueueEntry {
  id: string;
  campaignId: string;
  contactEmail: string;
  contactName: string;
  brand: string;
  personalizedSubject: string;
  personalizedBody: string;
  sendWindow: string;
  status: 'queued' | 'ready' | 'sent' | 'failed';
  scheduledFor: string;
  sentAt?: string;
  opened: boolean;
  openedAt?: string;
  clicked: boolean;
  clickedAt?: string;
  frequencyCheckPassed: boolean;
  qualityScore: number;
  delayReason?: string;
}

export interface FrequencyCheckResult {
  allowed: boolean;
  delayUntil?: string;
  reason: string;
  ruleViolated?: string;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  tokensUsed?: number;
}

export interface Agent1Response {
  brand: string;
  campaignGoal: 'follow-up' | 'nurture' | 'announcement' | 're-engagement';
  targetAudienceCriteria: TargetCriteria;
  urgency: 'immediate' | 'scheduled' | 'recurring' | 'autopilot';
  recommendedTemplateCategory: string;
  reasoning: string;
}

export interface Agent2Response {
  selectedContacts: Array<{
    contactId: string;
    email: string;
    selectionScore: number;
    reasoning: string;
  }>;
  excludedContacts: Array<{
    contactId: string;
    reason: string;
  }>;
  summary: {
    totalSelected: number;
    avgScore: number;
    riskFactors: string[];
  };
}

export interface Agent3Response {
  personalizedSubject: string;
  personalizedBody: string;
  personalizationScore: number;
  variablesReplaced: string[];
}

export interface Agent5Response {
  qualityScore: number;
  dimensions: {
    clarity: number;
    relevance: number;
    personalization: number;
    callToAction: number;
    brandVoice: number;
  };
  feedback: string;
  approved: boolean;
}

export interface SendHistoryEntry {
  id: string;
  contactId: string;
  contactEmail: string;
  campaignId: string;
  campaignName: string;
  brand: string;
  sendingAccount: string;
  subject: string;
  scheduledSendTime: string;
  actualSendTime?: string;
  sendStatus: 'queued' | 'sent' | 'failed' | 'bounced';
  opened: boolean;
  openedAt?: string;
  clicked: boolean;
  clickedAt?: string;
  errorMessage?: string;
}
