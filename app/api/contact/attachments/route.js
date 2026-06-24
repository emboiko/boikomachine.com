import path from 'path';
import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { getAdminSessionFromRequest } from '@/lib/auth/session';
import {
  isContactAttachmentPath,
  sanitizeAttachmentFilename,
  shouldInlineAttachment,
} from '@/lib/storage/blob';

export const GET = async (request) => {
  const requestUrl = new URL(request.url);
  const pathname = requestUrl.searchParams.get('pathname');
  const filenameParam = requestUrl.searchParams.get('filename');

  if (!isContactAttachmentPath(pathname)) {
    return NextResponse.json({ message: 'Invalid attachment path.' }, { status: 400 });
  }

  const adminSession = await getAdminSessionFromRequest(request);

  if (!adminSession) {
    const loginUrl = new URL('/admin/login', request.url);
    const returnPath = `${requestUrl.pathname}${requestUrl.search}`;

    loginUrl.searchParams.set('returnTo', returnPath);

    return NextResponse.redirect(loginUrl);
  }

  const result = await get(pathname, { access: 'private' });

  if (!result || result.statusCode !== 200) {
    return NextResponse.json({ message: 'Attachment not found.' }, { status: 404 });
  }

  const downloadFilename = sanitizeAttachmentFilename(
    filenameParam || path.basename(pathname),
  );
  const dispositionType = shouldInlineAttachment(result.blob.contentType, downloadFilename)
    ? 'inline'
    : 'attachment';

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType,
      'Content-Disposition': `${dispositionType}; filename="${downloadFilename}"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
