import { NextResponse } from 'next/server';
import { createContactSubmission } from '@/lib/services/contactService';
import {
  contactFieldsSchema,
  hashIpAddress,
  verifyTurnstileToken,
} from '@/lib/validation/contact';

export const POST = async (request) => {
  try {
    const formData = await request.formData();

    const fields = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      message: String(formData.get('message') || ''),
      turnstileToken: String(formData.get('turnstileToken') || ''),
    };

    const parsed = contactFieldsSchema.safeParse(fields);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid form submission.', errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const remoteIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip');

    const turnstileValid = await verifyTurnstileToken(
      parsed.data.turnstileToken,
      remoteIp,
    );

    if (!turnstileValid) {
      return NextResponse.json(
        { message: 'Verification challenge failed. Please try again.' },
        { status: 400 },
      );
    }

    const files = formData.getAll('files');
    const submission = await createContactSubmission({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
      files,
      ipHash: hashIpAddress(remoteIp),
    });

    return NextResponse.json({
      message: 'Thank you. Your message has been received.',
      submission,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to submit contact form.' },
      { status: 500 },
    );
  }
};
