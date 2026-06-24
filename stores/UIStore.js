import { types } from 'mobx-state-tree';

export const UIStore = types
  .model('UIStore', {
    mobileNavOpen: types.optional(types.boolean, false),
    activeSection: types.optional(types.string, ''),
  })
  .actions((self) => ({
    toggleMobileNav() {
      self.mobileNavOpen = !self.mobileNavOpen;
    },
    closeMobileNav() {
      self.mobileNavOpen = false;
    },
    setActiveSection(sectionId) {
      self.activeSection = sectionId;
    },
  }));
