import { types, flow } from 'mobx-state-tree';
import { PORTFOLIO_CATEGORIES } from '@/lib/constants';
import {
  fetchPortfolioCategories,
  fetchPortfolioItemBySlug,
  fetchPortfolioItemsByCategory,
} from '@/services/client/portfolioClientService';

const toCategorySnapshots = (categories) => {
  return categories.map((category) => ({
    slug: category.slug,
    label: category.label,
    description: category.description,
    coverUrl: category.coverUrl ?? null,
  }));
};

const getFallbackCategories = () => {
  return PORTFOLIO_CATEGORIES.map((category) => ({
    slug: category.slug,
    label: category.label,
    description: category.description,
    coverUrl: null,
  }));
};

const PortfolioCategoryModel = types.model('PortfolioCategory', {
  slug: types.string,
  label: types.string,
  description: types.string,
  coverUrl: types.maybeNull(types.string),
});

const PortfolioListItemModel = types.model('PortfolioListItem', {
  id: types.identifier,
  slug: types.string,
  title: types.string,
  category: types.string,
  description: types.string,
  coverUrl: types.maybeNull(types.string),
  sortOrder: types.number,
  workStatus: types.maybeNull(types.string),
});

const PortfolioImageModel = types.model('PortfolioImage', {
  id: types.string,
  storageKey: types.string,
  url: types.string,
  alt: types.string,
  caption: types.string,
  sortOrder: types.number,
});

const PortfolioModel3dModel = types.model('PortfolioModel3d', {
  storageKey: types.string,
  originalName: types.string,
  url: types.string,
});

const PortfolioDetailItemModel = types.model('PortfolioDetailItem', {
  id: types.identifier,
  slug: types.string,
  title: types.string,
  category: types.string,
  description: types.string,
  coverUrl: types.maybeNull(types.string),
  coverStorageKey: types.maybeNull(types.string),
  sortOrder: types.number,
  workStatus: types.maybeNull(types.string),
  youtubeUrl: types.maybeNull(types.string),
  images: types.array(PortfolioImageModel),
  model3d: types.maybeNull(PortfolioModel3dModel),
});

export const PortfolioStore = types
  .model('PortfolioStore', {
    categories: types.optional(types.array(PortfolioCategoryModel), []),
    categoryItems: types.optional(types.array(PortfolioListItemModel), []),
    selectedItem: types.maybeNull(PortfolioDetailItemModel),
    isLoadingCategories: types.optional(types.boolean, false),
    isLoadingCategoryItems: types.optional(types.boolean, false),
    isLoadingItemDetail: types.optional(types.boolean, false),
    errorMessage: types.optional(types.string, ''),
    hasLoadedCategories: types.optional(types.boolean, false),
    explorerOpen: types.optional(types.boolean, false),
    explorerCategory: types.maybeNull(types.string),
    explorerItemSlug: types.maybeNull(types.string),
    explorerView: types.optional(
      types.enumeration('PortfolioExplorerView', ['gallery', 'detail']),
      'gallery',
    ),
  })
  .actions((self) => ({
    loadCategories: flow(function* loadCategories() {
      if (self.hasLoadedCategories) {
        return;
      }

      self.isLoadingCategories = true;
      self.errorMessage = '';

      try {
        const categories = yield fetchPortfolioCategories();
        self.categories.replace(toCategorySnapshots(categories));
        self.hasLoadedCategories = true;
      } catch (error) {
        self.errorMessage = error.message || 'Failed to load portfolio categories.';
        self.categories.replace(getFallbackCategories());
        self.hasLoadedCategories = true;
      } finally {
        self.isLoadingCategories = false;
      }
    }),

    loadCategoryItems: flow(function* loadCategoryItems(categorySlug) {
      self.isLoadingCategoryItems = true;
      self.errorMessage = '';

      try {
        const items = yield fetchPortfolioItemsByCategory(categorySlug);
        self.categoryItems.replace(items);
      } catch (error) {
        self.errorMessage = error.message || 'Failed to load portfolio items.';
      } finally {
        self.isLoadingCategoryItems = false;
      }
    }),

    loadItemDetail: flow(function* loadItemDetail(itemSlug) {
      self.isLoadingItemDetail = true;
      self.errorMessage = '';

      try {
        const item = yield fetchPortfolioItemBySlug(itemSlug);
        self.selectedItem = item;
      } catch (error) {
        self.errorMessage = error.message || 'Failed to load portfolio item.';
        self.selectedItem = null;
      } finally {
        self.isLoadingItemDetail = false;
      }
    }),

    openCategory: flow(function* openCategory(categorySlug) {
      self.explorerOpen = true;
      self.explorerCategory = categorySlug;
      self.explorerItemSlug = null;
      self.explorerView = 'gallery';
      self.selectedItem = null;
      yield self.loadCategoryItems(categorySlug);
    }),

    openItem: flow(function* openItem(itemSlug) {
      self.explorerItemSlug = itemSlug;
      self.explorerView = 'detail';
      yield self.loadItemDetail(itemSlug);
    }),

    navigateBack() {
      if (self.explorerView === 'detail') {
        self.explorerView = 'gallery';
        self.explorerItemSlug = null;
        self.selectedItem = null;
        return;
      }

      self.closeExplorer();
    },

    closeExplorer() {
      self.explorerOpen = false;
    },

    finishCloseExplorer() {
      self.explorerCategory = null;
      self.explorerItemSlug = null;
      self.explorerView = 'gallery';
      self.selectedItem = null;
      self.categoryItems.clear();
    },
  }));
