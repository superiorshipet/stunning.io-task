export interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'Payments' | 'E-Commerce' | 'Email' | 'Messaging' | 'Productivity' | string;
  authType: string;
  isEnabled: boolean;
  capabilities: string[];
  documentationUrl?: string;
}
