import { createHash } from 'crypto';
import { z } from 'zod';

export const analyticsEventSchema = z.object({
  type: z.enum(['page_view', 'cta_click', 'form_submit', 'portfolio_view']),
  path: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
  sessionId: z.string().optional(),
});

export const contactFieldsSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(200),
  email: z.string().email('A valid email is required.').max(320),
  phone: z.string().max(50).optional().or(z.literal('')),
  message: z.string().min(1, 'Message is required.').max(5000),
  turnstileToken: z.string().min(1, 'Please complete the verification challenge.'),
});

export const hashIpAddress = (ipAddress) => {
  if (!ipAddress) {
    return undefined;
  }

  return createHash('sha256').update(ipAddress).digest('hex');
};

export const verifyTurnstileToken = async (token, remoteIp) => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('TURNSTILE_SECRET_KEY is not configured.');
  }

  const body = new URLSearchParams({
    secret: secretKey,
    response: token,
  });

  if (remoteIp) {
    body.append('remoteip', remoteIp);
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const result = await response.json();
  return result.success === true;
};
