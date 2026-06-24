'use client';

import { useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { PortfolioCardImage } from '@/components/portfolio/PortfolioCardImage';
import { uploadAdminPortfolioMedia } from '@/services/client/adminPortfolioClientService';

const reorderImages = (images, fromIndex, toIndex) => {
  const nextImages = [...images];
  const [movedImage] = nextImages.splice(fromIndex, 1);
  nextImages.splice(toIndex, 0, movedImage);

  return nextImages.map((image, index) => ({
    ...image,
    sortOrder: index,
  }));
};

export const PortfolioImageManager = ({ images, coverStorageKey, onChange, onCoverChange }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileSelect = async (event) => {
    const fileList = Array.from(event.target.files || []);

    if (fileList.length === 0) {
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const uploadedImages = [];

      for (const file of fileList) {
        const upload = await uploadAdminPortfolioMedia(file, 'image');
        uploadedImages.push({
          storageKey: upload.storageKey,
          url: upload.url,
          alt: '',
          caption: '',
          sortOrder: images.length + uploadedImages.length,
        });
      }

      const nextImages = [...images, ...uploadedImages];
      onChange(nextImages);

      if (!coverStorageKey && nextImages.length > 0) {
        onCoverChange(nextImages[0].storageKey);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveImage = (storageKey) => {
    const nextImages = images
      .filter((image) => image.storageKey !== storageKey)
      .map((image, index) => ({ ...image, sortOrder: index }));

    onChange(nextImages);

    if (coverStorageKey === storageKey) {
      onCoverChange(nextImages[0]?.storageKey || null);
    }
  };

  const handleMoveImage = (index, direction) => {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= images.length) {
      return;
    }

    onChange(reorderImages(images, index, targetIndex));
  };

  const handleImageFieldChange = (storageKey, field, value) => {
    onChange(
      images.map((image) => {
        if (image.storageKey !== storageKey) {
          return image;
        }

        return {
          ...image,
          [field]: value,
        };
      }),
    );
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Photos
        </Typography>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,.jpg,.jpeg,.png,.webp,.heic"
          multiple
          hidden
          onChange={handleFileSelect}
        />
        <Button
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading…' : 'Add photos'}
        </Button>
      </Box>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {isUploading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Uploading photos…
          </Typography>
        </Box>
      ) : null}

      {images.map((image, index) => {
        const isCover = coverStorageKey === image.storageKey;

        return (
          <Box
            key={image.storageKey}
            sx={{
              border: 1,
              borderColor: isCover ? 'primary.main' : 'divider',
              borderRadius: 1,
              p: 2,
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ width: { xs: '100%', sm: 220 }, flexShrink: 0 }}>
                <PortfolioCardImage src={image.url} alt={image.alt || 'Portfolio photo'} />
              </Box>
              <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton
                    aria-label="Set as cover"
                    onClick={() => onCoverChange(image.storageKey)}
                    size="small"
                  >
                    {isCover ? <StarIcon color="primary" /> : <StarBorderIcon />}
                  </IconButton>
                  <Typography variant="body2" color="text.secondary">
                    {isCover ? 'Cover photo' : 'Set as cover'}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton
                    aria-label="Move photo up"
                    onClick={() => handleMoveImage(index, -1)}
                    disabled={index === 0}
                    size="small"
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="Move photo down"
                    onClick={() => handleMoveImage(index, 1)}
                    disabled={index === images.length - 1}
                    size="small"
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="Remove photo"
                    onClick={() => handleRemoveImage(image.storageKey)}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <TextField
                  label="Alt text"
                  value={image.alt || ''}
                  onChange={(event) => handleImageFieldChange(image.storageKey, 'alt', event.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Caption"
                  value={image.caption || ''}
                  onChange={(event) =>
                    handleImageFieldChange(image.storageKey, 'caption', event.target.value)
                  }
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                />
              </Stack>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
};
