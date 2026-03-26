export const getTaskEmoji = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes('medication') || lower.includes('medicine')) return '💊';
  if (lower.includes('exercise') || lower.includes('workout')) return '💪';
  if (lower.includes('book') || lower.includes('read')) return '📚';
  if (lower.includes('shop') || lower.includes('buy')) return '🛒';
  if (lower.includes('call') || lower.includes('phone')) return '📞';
  if (lower.includes('email') || lower.includes('mail')) return '📧';
  if (lower.includes('clean')) return '🧹';
  if (lower.includes('cook') || lower.includes('food')) return '🍳';
  return '📝';
};
