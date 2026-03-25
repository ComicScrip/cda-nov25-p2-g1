const clampProgress = (progress: number): number => {
  return Math.max(0, Math.min(progress, 100));
};

const getProgressHue = (progress: number): number => {
  return 120 - clampProgress(progress) * 1.2;
};

export const getObjectiveProgressColor = (progress: number): string => {
  const hue = getProgressHue(progress);
  return `hsl(${hue} 72% 38%)`;
};

export const getObjectiveProgressGradient = (progress: number): string => {
  const hue = getProgressHue(progress);
  return `linear-gradient(90deg, hsl(${hue} 70% 52%), hsl(${hue} 76% 38%))`;
};

export const getExceededObjectivePercentage = (progress: number): number => {
  return Math.max(0, Math.round(progress - 100));
};
