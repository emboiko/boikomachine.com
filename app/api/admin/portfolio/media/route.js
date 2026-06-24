import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth/session';
import { getPortfolioMediaUrl } from '@/lib/portfolio/mediaUrls';
import { uploadPortfolioImage, uploadPortfolioModelFile } from '@/lib/storage/blob';

export const POST = async (request) => {
  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const uploadType = formData.get('type') || 'image';

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ message: 'No file provided.' }, { status: 400 });
    }

    let upload;

    if (uploadType === 'model') {
      upload = await uploadPortfolioModelFile(file);
    } else {
      upload = await uploadPortfolioImage(file);
    }

    return NextResponse.json({
      upload: {
        storageKey: upload.storageKey,
        originalName: upload.originalName,
        url: getPortfolioMediaUrl(upload.storageKey, upload.originalName),
        mimeType: upload.mimeType,
        sizeBytes: upload.sizeBytes,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to upload file.' },
      { status: 400 },
    );
  }
};
