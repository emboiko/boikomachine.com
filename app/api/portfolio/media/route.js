import path from 'path';
import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import {
  isPortfolioMediaPath,
  sanitizeAttachmentFilename,
  shouldInlineAttachment,
} from '@/lib/storage/blob';

export const GET = async (request) => {
  const requestUrl = new URL(request.url);
  const pathname = requestUrl.searchParams.get('pathname');
  const filenameParam = requestUrl.searchParams.get('filename');

  if (!isPortfolioMediaPath(pathname)) {
    return NextResponse.json({ message: 'Invalid media path.' }, { status: 400 });
  }

  const result = await get(pathname, { access: 'private' });

  if (!result || result.statusCode !== 200) {
    return NextResponse.json({ message: 'Media not found.' }, { status: 404 });
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
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
