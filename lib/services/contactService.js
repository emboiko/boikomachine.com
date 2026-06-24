import { Resend } from 'resend';
import { connectToDatabase } from '@/lib/db/mongoose';
import { ContactSubmission } from '@/lib/models/ContactSubmission';
import { uploadContactFiles, getContactAttachmentDownloadUrl, formatFileSize } from '@/lib/storage/blob';
import { BUSINESS } from '@/lib/constants';

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
};

const buildNotificationEmail = (submission) => {
  const attachmentLines = submission.attachments
    .map((attachment, index) => {
      const downloadUrl = getContactAttachmentDownloadUrl(
        attachment.storageKey,
        attachment.originalName,
      );
      const sizeLabel = formatFileSize(attachment.sizeBytes);

      return [
        `${index + 1}. ${attachment.originalName} (${sizeLabel})`,
        `   ${downloadUrl}`,
      ].join('\n');
    })
    .join('\n');

  const attachmentSection =
    submission.attachments.length > 0
      ? [
          '',
          'Attachments:',
          attachmentLines,
        ].join('\n')
      : '\n\nAttachments: none';

  return {
    subject: `New contact submission - ${submission.name}`,
    text: [
      `New contact form submission for ${BUSINESS.name}`,
      '',
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      `Phone: ${submission.phone || 'not provided'}`,
      '',
      'Message:',
      submission.message,
      attachmentSection,
    ].join('\n'),
  };
};

export const sendContactNotification = async (submission) => {
  const resend = getResendClient();

  if (!resend) {
    return { sent: false, reason: 'RESEND_API_KEY not configured' };
  }

  const emailContent = buildNotificationEmail(submission);

  await resend.emails.send({
    from: `${BUSINESS.name} <${BUSINESS.shopEmail}>`,
    to: BUSINESS.shopEmail,
    replyTo: submission.email,
    subject: emailContent.subject,
    text: emailContent.text,
  });

  return { sent: true };
};

export const createContactSubmission = async ({
  name,
  email,
  phone,
  message,
  files,
  ipHash,
}) => {
  await connectToDatabase();

  const attachments = await uploadContactFiles(files);

  const submission = await ContactSubmission.create({
    name,
    email,
    phone: phone || undefined,
    message,
    attachments,
    source: 'contact_form',
    ipHash,
  });

  let emailResult = { sent: false, reason: 'not attempted' };

  try {
    emailResult = await sendContactNotification(submission);
  } catch (error) {
    emailResult = { sent: false, reason: error.message };
  }

  return {
    id: submission._id.toString(),
    emailSent: emailResult.sent,
  };
};
