
export enum AppStage {
  SETUP = 'SETUP',
  GENERATING = 'GENERATING',
  PROPOSAL = 'PROPOSAL',
  SUCCESS = 'SUCCESS'
}

export interface ProposalDetails {
  partnerName: string;
  senderName: string;
  memories: string;
  vibe: 'funny' | 'romantic' | 'poetic' | 'nerdy' | 'roast';
  partnerGender: 'He' | 'She' | 'They';
  personalNote?: string;
  relationship: 'partner' | 'friend';
}

export interface GeneratedContent {
  poem: string;
  headline: string;
  personalNote?: string; // Passed through from input
  partnerGender?: string; // Passed through for context
  relationship?: 'partner' | 'friend';
  senderName?: string; // Passed through for notification
}
