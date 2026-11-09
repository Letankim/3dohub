/**
 * Types and interfaces for the QR Code Generator module.
 */

export type QrContentType = 'URL' | 'TEXT' | 'WIFI' | 'VCARD' | 'EMAIL' | 'PHONE';

export interface WifiConfig {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardConfig {
  fullName: string;
  phone: string;
  email?: string;
  organization?: string;
  title?: string;
  website?: string;
  address?: string;
}

export interface EmailConfig {
  email: string;
  subject?: string;
  body?: string;
}

export interface PhoneConfig {
  phone: string;
  action: 'call' | 'sms';
  smsBody?: string;
}

export interface QrCustomization {
  size: number;
  fgColor: string;
  bgColor: string;
  errorLevel: 'L' | 'M' | 'Q' | 'H';
  icon?: string;
  iconSize?: number;
  bordered: boolean;
}

export interface QrHistoryItem {
  id: string;
  type: QrContentType;
  title: string;
  rawContent: string;
  createdAt: string;
}

