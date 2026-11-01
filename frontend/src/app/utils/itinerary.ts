export function getItineraryLabel(value?: string, index?: number) {
  const trimmed = typeof value === 'string' ? value.trim() : value;
  if (trimmed) {
    return trimmed;
  }
  if (typeof index === 'number') {
    return `Day ${index + 1}`;
  }
  return 'Day';
}

export function normalizeItineraryDays<T extends { day?: string }>(itinerary: T[]) {
  return itinerary.map((item, index) => ({
    ...item,
    day: getItineraryLabel(item.day, index),
  }));
}
