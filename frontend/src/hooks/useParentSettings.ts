const settingsKey = 'numsenseParentSettings';

interface ParentSettings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  questionsPerLesson: number;
}

const defaultSettings: ParentSettings = {
  soundEnabled: true,
  animationsEnabled: true,
  questionsPerLesson: 4,
};

export const readParentSettings = (): ParentSettings => {
  const saved = localStorage.getItem(settingsKey);
  if (!saved) return defaultSettings;

  try {
    return { ...defaultSettings, ...JSON.parse(saved) };
  } catch {
    return defaultSettings;
  }
};

export const getQuestionsPerLesson = (): number => {
  const settings = readParentSettings();
  const value = Number(settings.questionsPerLesson);
  return Number.isFinite(value) ? Math.max(3, Math.min(8, value)) : 4;
};

/**
 * Hook that reads parent settings from localStorage.
 * Call at the top of a component to get the questionsPerLesson value.
 */
export const useParentSettings = () => {
  return {
    questionsPerLesson: getQuestionsPerLesson(),
    settings: readParentSettings(),
  };
};
