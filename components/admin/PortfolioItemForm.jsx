'use client';

import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PortfolioImageManager } from '@/components/admin/PortfolioImageManager';
import { PORTFOLIO_CATEGORIES } from '@/lib/constants';
import { slugifyTitle } from '@/lib/portfolio/slugify';
import { uploadAdminPortfolioMedia } from '@/services/client/adminPortfolioClientService';

const workStatusOptions = [
  { value: '', label: 'Not specified' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'final', label: 'Final part' },
  { value: 'in_progress', label: 'In progress' },
];

const buildInitialState = (initialItem) => {
  if (initialItem) {
    return {
      title: initialItem.title,
      slug: initialItem.slug,
      category: initialItem.category,
      description: initialItem.description,
      youtubeUrl: initialItem.youtubeUrl || '',
      workStatus: initialItem.workStatus || '',
      sortOrder: initialItem.sortOrder ?? 0,
      images: initialItem.images.map((image) => ({
        storageKey: image.storageKey,
        url: image.url,
        alt: image.alt || '',
        caption: image.caption || '',
        sortOrder: image.sortOrder ?? 0,
      })),
      coverStorageKey: initialItem.coverStorageKey || initialItem.images[0]?.storageKey || null,
      model3d: initialItem.model3d || null,
    };
  }

  return {
    title: '',
    slug: '',
    category: PORTFOLIO_CATEGORIES[0].slug,
    description: '',
    youtubeUrl: '',
    workStatus: '',
    sortOrder: 0,
    images: [],
    coverStorageKey: null,
    model3d: null,
  };
};

export const PortfolioItemForm = ({ initialItem, onSubmit, onDelete, isDeleting = false }) => {
  const [formState, setFormState] = useState(() => buildInitialState(initialItem));
  const [slugTouched, setSlugTouched] = useState(Boolean(initialItem));
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingModel, setIsUploadingModel] = useState(false);

  const submitLabel = useMemo(() => {
    if (initialItem) {
      return 'Save changes';
    }

    return 'Create project';
  }, [initialItem]);

  const updateField = (field, value) => {
    setFormState((currentState) => {
      const nextState = {
        ...currentState,
        [field]: value,
      };

      if (field === 'title' && !slugTouched) {
        nextState.slug = slugifyTitle(value);
      }

      return nextState;
    });
  };

  const handleModelUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploadingModel(true);
    setErrorMessage('');

    try {
      const upload = await uploadAdminPortfolioMedia(file, 'model');
      setFormState((currentState) => ({
        ...currentState,
        model3d: {
          storageKey: upload.storageKey,
          originalName: upload.originalName,
          url: upload.url,
        },
      }));
    } catch (error) {
      setErrorMessage(error.message || 'Failed to upload 3D model.');
    } finally {
      setIsUploadingModel(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const payload = {
        title: formState.title.trim(),
        slug: formState.slug.trim(),
        category: formState.category,
        description: formState.description.trim(),
        youtubeUrl: formState.youtubeUrl.trim() || null,
        workStatus: formState.workStatus || null,
        sortOrder: Number(formState.sortOrder) || 0,
        images: formState.images.map((image, index) => ({
          storageKey: image.storageKey,
          alt: image.alt || '',
          caption: image.caption || '',
          sortOrder: index,
        })),
        coverStorageKey: formState.coverStorageKey,
        model3d: formState.model3d
          ? {
              storageKey: formState.model3d.storageKey,
              originalName: formState.model3d.originalName,
            }
          : null,
      };

      await onSubmit(payload);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to save portfolio item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack component="form" spacing={3} onSubmit={handleSubmit}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <TextField
        label="Title"
        value={formState.title}
        onChange={(event) => updateField('title', event.target.value)}
        required
        fullWidth
      />

      <TextField
        label="Slug"
        value={formState.slug}
        onChange={(event) => {
          setSlugTouched(true);
          updateField('slug', event.target.value);
        }}
        required
        fullWidth
        helperText="Used in URLs and analytics. Lowercase letters, numbers, and hyphens only."
      />

      <FormControl fullWidth required>
        <InputLabel id="portfolio-category-label">Category</InputLabel>
        <Select
          labelId="portfolio-category-label"
          label="Category"
          value={formState.category}
          onChange={(event) => updateField('category', event.target.value)}
        >
          {PORTFOLIO_CATEGORIES.map((category) => (
            <MenuItem key={category.slug} value={category.slug}>
              {category.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Description"
        value={formState.description}
        onChange={(event) => updateField('description', event.target.value)}
        required
        fullWidth
        multiline
        minRows={4}
      />

      <FormControl fullWidth>
        <InputLabel id="portfolio-work-status-label">Work status</InputLabel>
        <Select
          labelId="portfolio-work-status-label"
          label="Work status"
          value={formState.workStatus}
          onChange={(event) => updateField('workStatus', event.target.value)}
        >
          {workStatusOptions.map((option) => (
            <MenuItem key={option.value || 'none'} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Sort order"
        type="number"
        value={formState.sortOrder}
        onChange={(event) => updateField('sortOrder', event.target.value)}
        fullWidth
        helperText="Lower numbers appear first within a category."
      />

      <TextField
        label="YouTube URL"
        value={formState.youtubeUrl}
        onChange={(event) => updateField('youtubeUrl', event.target.value)}
        fullWidth
        placeholder="https://www.youtube.com/watch?v=..."
      />

      <PortfolioImageManager
        images={formState.images}
        coverStorageKey={formState.coverStorageKey}
        onChange={(images) => updateField('images', images)}
        onCoverChange={(coverStorageKey) => updateField('coverStorageKey', coverStorageKey)}
      />

      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          3D model file (optional)
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Button variant="outlined" component="label" disabled={isUploadingModel}>
            {isUploadingModel ? 'Uploading…' : 'Upload 3D file'}
            <input type="file" hidden onChange={handleModelUpload} />
          </Button>
          {formState.model3d ? (
            <Typography variant="body2" color="text.secondary">
              {formState.model3d.originalName}
            </Typography>
          ) : null}
          {formState.model3d ? (
            <Button
              variant="text"
              color="inherit"
              onClick={() => updateField('model3d', null)}
            >
              Remove
            </Button>
          ) : null}
        </Stack>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
        {onDelete ? (
          <Button
            type="button"
            variant="outlined"
            color="error"
            onClick={onDelete}
            disabled={isDeleting || isSubmitting}
          >
            {isDeleting ? 'Deleting…' : 'Delete project'}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
};
