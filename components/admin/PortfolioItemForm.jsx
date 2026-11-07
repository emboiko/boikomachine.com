'use client';

import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { PortfolioImageManager } from '@/components/admin/PortfolioImageManager';
import { PORTFOLIO_CATEGORIES } from '@/lib/constants';
import { slugifyTitle } from '@/lib/portfolio/slugify';
import { fetchAdminPortfolioItems } from '@/services/client/adminPortfolioClientService';

const countItemsInCategory = (items, categorySlug) => {
  return items.filter((item) => item.category === categorySlug).length;
};

const buildInitialState = (initialItem) => {
  if (initialItem) {
    return {
      title: initialItem.title,
      slug: initialItem.slug,
      category: initialItem.category,
      description: initialItem.description,
      youtubeUrl: initialItem.youtubeUrl || '',
      material: initialItem.material || '',
      sortOrder: initialItem.sortOrder ?? 0,
      images: initialItem.images.map((image) => ({
        storageKey: image.storageKey,
        url: image.url,
        alt: image.alt || '',
        caption: image.caption || '',
        sortOrder: image.sortOrder ?? 0,
      })),
      coverStorageKey: initialItem.coverStorageKey || initialItem.images[0]?.storageKey || null,
    };
  }

  return {
    title: '',
    slug: '',
    category: PORTFOLIO_CATEGORIES[0].slug,
    description: '',
    youtubeUrl: '',
    material: '',
    sortOrder: 0,
    images: [],
    coverStorageKey: null,
  };
};

export const PortfolioItemForm = ({ initialItem, onSubmit, onDelete, isDeleting = false }) => {
  const [formState, setFormState] = useState(() => buildInitialState(initialItem));
  const [slugTouched, setSlugTouched] = useState(Boolean(initialItem));
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryItemCounts, setCategoryItemCounts] = useState(null);
  const isCreateMode = !initialItem;

  const submitLabel = useMemo(() => {
    if (initialItem) {
      return 'Save changes';
    }

    return 'Create project';
  }, [initialItem]);

  useEffect(() => {
    if (!isCreateMode) {
      return undefined;
    }

    let isCancelled = false;

    const loadCategoryCounts = async () => {
      try {
        const items = await fetchAdminPortfolioItems();

        if (isCancelled) {
          return;
        }

        const countsByCategory = {};

        for (const category of PORTFOLIO_CATEGORIES) {
          countsByCategory[category.slug] = countItemsInCategory(items, category.slug);
        }

        setCategoryItemCounts(countsByCategory);
        setFormState((currentState) => ({
          ...currentState,
          sortOrder: countsByCategory[currentState.category] ?? 0,
        }));
      } catch {
        if (!isCancelled) {
          setCategoryItemCounts(null);
        }
      }
    };

    loadCategoryCounts();

    return () => {
      isCancelled = true;
    };
  }, [isCreateMode]);

  const updateField = (field, value) => {
    setFormState((currentState) => {
      const nextState = {
        ...currentState,
        [field]: value,
      };

      if (field === 'title' && !slugTouched) {
        nextState.slug = slugifyTitle(value);
      }

      if (field === 'category' && isCreateMode && categoryItemCounts) {
        nextState.sortOrder = categoryItemCounts[value] ?? 0;
      }

      return nextState;
    });
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
        material: formState.material.trim() || null,
        sortOrder: Number(formState.sortOrder) || 0,
        images: formState.images.map((image, index) => ({
          storageKey: image.storageKey,
          alt: image.alt || '',
          caption: image.caption || '',
          sortOrder: index,
        })),
        coverStorageKey: formState.coverStorageKey,
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

      <TextField
        label="Material"
        value={formState.material}
        onChange={(event) => updateField('material', event.target.value)}
        fullWidth
        placeholder="6061 aluminum, PETG plastic, mild steel, etc."
        helperText="Optional. Shown above the project title in the gallery and detail views."
      />

      <TextField
        label="Sort order"
        type="number"
        value={formState.sortOrder}
        onChange={(event) => updateField('sortOrder', event.target.value)}
        fullWidth
        helperText="Lower numbers appear first within a category. Other projects shift to keep order contiguous."
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
