import { types } from 'mobx-state-tree';
import { UIStore } from '@/stores/UIStore';
import { ContactStore } from '@/stores/ContactStore';
import { PortfolioStore } from '@/stores/PortfolioStore';

export const RootStore = types.model('RootStore', {
  ui: types.optional(UIStore, {}),
  contact: types.optional(ContactStore, {}),
  portfolio: types.optional(PortfolioStore, {}),
});

export const createRootStore = () => {
  return RootStore.create({});
};
