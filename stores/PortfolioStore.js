import { types, flow } from 'mobx-state-tree';
import { fetchPortfolioItems } from '@/services/client/portfolioClientService';

const PortfolioItemModel = types.model('PortfolioItem', {
  id: types.identifier,
  slug: types.string,
  title: types.string,
  category: types.string,
  description: types.string,
  imageUrl: types.string,
  sortOrder: types.number,
});

export const PortfolioStore = types
  .model('PortfolioStore', {
    items: types.optional(types.array(PortfolioItemModel), []),
    isLoading: types.optional(types.boolean, false),
    errorMessage: types.optional(types.string, ''),
    hasLoaded: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    loadItems: flow(function* loadItems() {
      if (self.isLoading) {
        return;
      }

      self.isLoading = true;
      self.errorMessage = '';

      try {
        const items = yield fetchPortfolioItems();
        self.items.replace(
          items.map((item) => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            category: item.category,
            description: item.description,
            imageUrl: item.imageUrl,
            sortOrder: item.sortOrder,
          })),
        );
        self.hasLoaded = true;
      } catch (error) {
        self.errorMessage = error.message || 'Failed to load portfolio.';
      } finally {
        self.isLoading = false;
      }
    }),
  }));
