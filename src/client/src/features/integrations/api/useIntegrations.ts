import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { Integration } from '../types';

export const FALLBACK_INTEGRATIONS: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments, manage customer subscriptions, and handle checkout sessions.',
    category: 'Payments',
    authType: 'ApiKey',
    isEnabled: true,
    capabilities: ['payments', 'subscriptions', 'invoices', 'webhooks'],
    documentationUrl: 'https://stripe.com/docs/api',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Connect storefront inventory, synchronize catalog products, and track orders.',
    category: 'Commerce',
    authType: 'OAuth2',
    isEnabled: true,
    capabilities: ['products', 'orders', 'inventory', 'customers'],
    documentationUrl: 'https://shopify.dev/docs/api',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Dispatch transactional notifications, order confirmations, and sync threads.',
    category: 'Communication',
    authType: 'OAuth2',
    isEnabled: true,
    capabilities: ['send_email', 'read_threads', 'templates'],
    documentationUrl: 'https://developers.google.com/gmail/api',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Deliver real-time alerts, operational webhooks, and channel notifications.',
    category: 'Communication',
    authType: 'OAuth2',
    isEnabled: true,
    capabilities: ['post_message', 'incoming_webhooks', 'channels'],
    documentationUrl: 'https://api.slack.com',
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Append lead captures, form submissions, and export rows in real time.',
    category: 'Data',
    authType: 'OAuth2',
    isEnabled: true,
    capabilities: ['read_rows', 'append_rows', 'batch_update'],
    documentationUrl: 'https://developers.google.com/sheets/api',
  },
];

export function useIntegrations() {
  return useQuery<Integration[]>({
    queryKey: ['integrations'],
    queryFn: async () => {
      try {
        const data = await apiFetch<Integration[]>('/api/v1/integrations');
        return data && data.length > 0 ? data : FALLBACK_INTEGRATIONS;
      } catch {
        return FALLBACK_INTEGRATIONS;
      }
    },
    staleTime: 1000 * 60 * 10,
    initialData: FALLBACK_INTEGRATIONS,
  });
}
