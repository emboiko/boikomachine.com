import { connectToDatabase } from '@/lib/db/mongoose';
import { PORTFOLIO_CATEGORIES } from '@/lib/constants';
import { PortfolioItem } from '@/lib/models/PortfolioItem';
import { getPortfolioMediaUrl } from '@/lib/portfolio/mediaUrls';

const sortImages = (images) => {
  return [...(images || [])].sort((left, right) => left.sortOrder - right.sortOrder);
};

const getCoverStorageKey = (item) => {
  if (item.coverStorageKey) {
    return item.coverStorageKey;
  }

  const sortedImages = sortImages(item.images);

  if (sortedImages.length > 0) {
    return sortedImages[0].storageKey;
  }

  return null;
};

const getCoverUrl = (item) => {
  const coverStorageKey = getCoverStorageKey(item);

  if (!coverStorageKey) {
    return null;
  }

  return getPortfolioMediaUrl(coverStorageKey);
};

const mapImage = (image, index) => {
  const imageId = image._id ? image._id.toString() : image.storageKey || `image-${index}`;

  return {
    id: imageId,
    storageKey: image.storageKey,
    url: getPortfolioMediaUrl(image.storageKey),
    alt: image.alt || '',
    caption: image.caption || '',
    sortOrder: image.sortOrder ?? 0,
  };
};

const mapModel3d = (model3d) => {
  if (!model3d) {
    return null;
  }

  return {
    storageKey: model3d.storageKey,
    originalName: model3d.originalName,
    url: getPortfolioMediaUrl(model3d.storageKey, model3d.originalName),
  };
};

const mapListItem = (item) => {
  return {
    id: item._id.toString(),
    slug: item.slug,
    title: item.title,
    category: item.category,
    description: item.description,
    coverUrl: getCoverUrl(item),
    sortOrder: item.sortOrder ?? 0,
    material: item.material || null,
  };
};

const mapDetailItem = (item) => {
  return {
    ...mapListItem(item),
    images: sortImages(item.images).map((image, index) => mapImage(image, index)),
    youtubeUrl: item.youtubeUrl || null,
    model3d: mapModel3d(item.model3d),
    coverStorageKey: getCoverStorageKey(item),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

export const getCategorySummaries = async () => {
  await connectToDatabase();

  const items = await PortfolioItem.find({})
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  const itemsByCategory = new Map();

  for (const item of items) {
    if (!itemsByCategory.has(item.category)) {
      itemsByCategory.set(item.category, []);
    }

    itemsByCategory.get(item.category).push(item);
  }

  return PORTFOLIO_CATEGORIES.map((category) => {
    const categoryItems = itemsByCategory.get(category.slug) || [];
    const leadItem = categoryItems[0];

    return {
      slug: category.slug,
      label: category.label,
      description: category.description,
      coverUrl: leadItem ? getCoverUrl(leadItem) : null,
    };
  });
};

export const getItemsByCategory = async (categorySlug) => {
  await connectToDatabase();

  const items = await PortfolioItem.find({ category: categorySlug })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  return items.map(mapListItem);
};

export const getPortfolioItemBySlug = async (slug) => {
  await connectToDatabase();

  const item = await PortfolioItem.findOne({ slug }).lean();

  if (!item) {
    return null;
  }

  return mapDetailItem(item);
};

export const listAllPortfolioItems = async () => {
  await connectToDatabase();

  const items = await PortfolioItem.find({})
    .sort({ category: 1, sortOrder: 1, createdAt: -1 })
    .lean();

  return items.map(mapDetailItem);
};

export const getPortfolioItemById = async (id) => {
  await connectToDatabase();

  const item = await PortfolioItem.findById(id).lean();

  if (!item) {
    return null;
  }

  return mapDetailItem(item);
};

export const createPortfolioItem = async (data) => {
  await connectToDatabase();

  const item = await PortfolioItem.create({
    slug: data.slug,
    title: data.title,
    category: data.category,
    description: data.description,
    images: data.images || [],
    coverStorageKey: data.coverStorageKey || null,
    youtubeUrl: data.youtubeUrl || null,
    model3d: data.model3d || null,
    material: data.material || null,
    sortOrder: data.sortOrder ?? 0,
  });

  return mapDetailItem(item.toObject());
};

export const updatePortfolioItem = async (id, data) => {
  await connectToDatabase();

  const item = await PortfolioItem.findByIdAndUpdate(
    id,
    {
      $set: {
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.images !== undefined ? { images: data.images } : {}),
        ...(data.coverStorageKey !== undefined ? { coverStorageKey: data.coverStorageKey } : {}),
        ...(data.youtubeUrl !== undefined ? { youtubeUrl: data.youtubeUrl || null } : {}),
        ...(data.model3d !== undefined ? { model3d: data.model3d } : {}),
        ...(data.material !== undefined ? { material: data.material || null } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      },
    },
    { new: true, runValidators: true },
  ).lean();

  if (!item) {
    return null;
  }

  return mapDetailItem(item);
};

export const deletePortfolioItem = async (id) => {
  await connectToDatabase();

  const result = await PortfolioItem.findByIdAndDelete(id);

  return Boolean(result);
};
