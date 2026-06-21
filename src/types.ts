/**
 * Types and interfaces for the Birthday Celebration App
 */

export interface BirthdayWish {
  id: string;
  senderName: string;
  relation: string;
  content: string;
  vibe: BirthdayVibe;
  createdAt: string;
  isAiGenerated?: boolean;
}

export type BirthdayVibe = 'heartwarming' | 'poetic' | 'nerdy' | 'professional' | 'epic';

export interface ConfettiConfig {
  type: 'colorful' | 'gold' | 'neon' | 'stars' | 'emojis';
  speed: number;
  density: number;
}
