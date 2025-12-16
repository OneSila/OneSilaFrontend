type BadgeData = { text: string; color: string; hoverText?: string };

const formatDateTime = (value: string) => {
  try {
    return new Date(value).toLocaleString();
  } catch (e) {
    return value;
  }
};

const daysBetween = (from: Date, to: Date) => {
  const ms = to.getTime() - from.getTime();
  return ms / (1000 * 60 * 60 * 24);
};

export const buildAmazonIssueLastFetchedAtBadge = (t: Function, createdAt?: string | null): BadgeData => {
  if (!createdAt) {
    return { text: t('integrations.show.amazonIssues.lastFetchedAt.badges.unknown'), color: 'gray' };
  }

  const createdAtDate = new Date(createdAt);
  if (Number.isNaN(createdAtDate.getTime())) {
    return { text: t('integrations.show.amazonIssues.lastFetchedAt.badges.unknown'), color: 'gray' };
  }

  const ageDays = daysBetween(createdAtDate, new Date());

  if (ageDays <= 14) {
    return {
      text: t('integrations.show.amazonIssues.lastFetchedAt.badges.lte2w'),
      color: 'green',
      hoverText: t('integrations.show.amazonIssues.lastFetchedAt.hover', { date: formatDateTime(createdAt) }),
    };
  }

  if (ageDays <= 56) {
    return {
      text: t('integrations.show.amazonIssues.lastFetchedAt.badges.between2w8w'),
      color: 'yellow',
      hoverText: t('integrations.show.amazonIssues.lastFetchedAt.hover', { date: formatDateTime(createdAt) }),
    };
  }

  if (ageDays <= 183) {
    return {
      text: t('integrations.show.amazonIssues.lastFetchedAt.badges.between8w6m'),
      color: 'orange',
      hoverText: t('integrations.show.amazonIssues.lastFetchedAt.hover', { date: formatDateTime(createdAt) }),
    };
  }

  return {
    text: t('integrations.show.amazonIssues.lastFetchedAt.badges.gte6m'),
    color: 'red',
    hoverText: t('integrations.show.amazonIssues.lastFetchedAt.hover', { date: formatDateTime(createdAt) }),
  };
};

export const formatAmazonIssueLastFetchedAt = (createdAt?: string | null) => {
  if (!createdAt) {
    return '-';
  }
  return formatDateTime(createdAt);
};

