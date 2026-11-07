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

const countItemsInCategory = async (category, excludeId = null) => {
  const filter = { category };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return PortfolioItem.countDocuments(filter);
};

const clampSortOrder = (sortOrder, maxIndex) => {
  if (!Number.isFinite(sortOrder) || sortOrder < 0) {
    return 0;
  }

  if (sortOrder > maxIndex) {
    return maxIndex;
  }

  return Math.trunc(sortOrder);
};

const shiftSortOrders = async ({ category, fromSortOrder, delta, excludeId = null }) => {
  const filter = {
    category,
    sortOrder: { $gte: fromSortOrder },
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  await PortfolioItem.updateMany(filter, { $inc: { sortOrder: delta } });
};

const compactSortOrdersAfterRemoval = async ({ category, removedSortOrder, excludeId = null }) => {
  const filter = {
    category,
    sortOrder: { $gt: removedSortOrder },
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  await PortfolioItem.updateMany(filter, { $inc: { sortOrder: -1 } });
};

export const createPortfolioItem = async (data) => {
  await connectToDatabase();

  const categoryCount = await countItemsInCategory(data.category);
  const desiredSortOrder =
    data.sortOrder === undefined || data.sortOrder === null
      ? categoryCount
      : clampSortOrder(data.sortOrder, categoryCount);

  await shiftSortOrders({
    category: data.category,
    fromSortOrder: desiredSortOrder,
    delta: 1,
  });

  const item = await PortfolioItem.create({
    slug: data.slug,
    title: data.title,
    category: data.category,
    description: data.description,
    images: data.images || [],
    coverStorageKey: data.coverStorageKey || null,
    youtubeUrl: data.youtubeUrl || null,
    material: data.material || null,
    sortOrder: desiredSortOrder,
  });

  return mapDetailItem(item.toObject());
};

export const updatePortfolioItem = async (id, data) => {
  await connectToDatabase();

  const existingItem = await PortfolioItem.findById(id).lean();

  if (!existingItem) {
    return null;
  }

  const nextCategory = data.category !== undefined ? data.category : existingItem.category;
  const categoryChanged = nextCategory !== existingItem.category;
  const existingSortOrder = existingItem.sortOrder ?? 0;
  const sortOrderProvided = data.sortOrder !== undefined;

  const targetCategoryCount = await countItemsInCategory(nextCategory, existingItem._id);
  const requestedSortOrder = sortOrderProvided
    ? data.sortOrder
    : categoryChanged
      ? targetCategoryCount
      : existingSortOrder;
  const nextSortOrder = clampSortOrder(requestedSortOrder, targetCategoryCount);
  const shouldReorder = categoryChanged || nextSortOrder !== existingSortOrder;

  if (shouldReorder) {
    await compactSortOrdersAfterRemoval({
      category: existingItem.category,
      removedSortOrder: existingSortOrder,
      excludeId: existingItem._id,
    });

    await shiftSortOrders({
      category: nextCategory,
      fromSortOrder: nextSortOrder,
      delta: 1,
      excludeId: existingItem._id,
    });
  }

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
        ...(data.material !== undefined ? { material: data.material || null } : {}),
        ...(shouldReorder ? { sortOrder: nextSortOrder } : {}),
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

  const existingItem = await PortfolioItem.findById(id).lean();

  if (!existingItem) {
    return false;
  }

  const result = await PortfolioItem.findByIdAndDelete(id);

  if (!result) {
    return false;
  }

  await compactSortOrdersAfterRemoval({
    category: existingItem.category,
    removedSortOrder: existingItem.sortOrder ?? 0,
  });

  return true;
};
