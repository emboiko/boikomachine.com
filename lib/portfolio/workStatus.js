export const getPortfolioWorkStatusLabel = (workStatus) => {
  if (workStatus === 'prototype') {
    return 'Prototype';
  }

  if (workStatus === 'final') {
    return 'Final part';
  }

  if (workStatus === 'in_progress') {
    return 'In progress';
  }

  return null;
};
