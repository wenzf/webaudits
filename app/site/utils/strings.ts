export const truncateString = (text: string, limit: number = 80): string => {
  if (text.length <= limit) {
    return text;
  }

  return text.slice(0, limit - 3) + "…";
};


