export interface Badge {
  id: string;
  icon: string;
  name: string;
  description: string;
  color: string;
}

export const BADGES: Badge[] = [
  { id: 'first_lesson', icon: '⭐', name: 'Siêu Sao', description: 'Hoàn thành bài học đầu tiên', color: '#FFE1A5' },
  { id: 'three_lessons', icon: '🐟', name: 'Cá Vàng', description: 'Hoàn thành 3 bài học khác nhau', color: '#9DD9E8' },
  { id: 'perfect_score', icon: '💫', name: 'Hoa Mai', description: 'Đạt điểm tuyệt đối trong bài học', color: '#F7A6B8' },
  { id: 'challenge_any', icon: '🦋', name: 'Bướm Bay', description: 'Hoàn thành thử thách Cân hoặc Nhanh mắt', color: '#CDBBE3' },
  { id: 'all_lessons', icon: '🌈', name: 'Cầu Vồng', description: 'Hoàn thành tất cả 8 bài học', color: '#A5D6A7' },
  { id: 'monster_slayer', icon: '🏆', name: 'Vô Địch', description: 'Đánh bại quái vật trong thử thách', color: '#FFD39A' },
];

export interface ChildProgress {
  completedLessons: string[];
  completedChallenges: string[];
  earnedBadges: string[];
}

const getProgressKey = (childId: string) => `numsenseProgress_${childId}`;

export const getChildProgress = (childId: string): ChildProgress => {
  if (!childId) return { completedLessons: [], completedChallenges: [], earnedBadges: [] };
  const saved = localStorage.getItem(getProgressKey(childId));
  if (!saved) return { completedLessons: [], completedChallenges: [], earnedBadges: [] };

  try {
    const parsed = JSON.parse(saved);
    return {
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      completedChallenges: Array.isArray(parsed.completedChallenges) ? parsed.completedChallenges : [],
      earnedBadges: Array.isArray(parsed.earnedBadges) ? parsed.earnedBadges : [],
    };
  } catch {
    return { completedLessons: [], completedChallenges: [], earnedBadges: [] };
  }
};

export const saveChildProgress = (childId: string, progress: ChildProgress) => {
  if (!childId) return;
  localStorage.setItem(getProgressKey(childId), JSON.stringify(progress));
};

export const getEarnedBadges = (childId: string): string[] => {
  return getChildProgress(childId).earnedBadges;
};

export const checkAndAwardLessonBadge = (
  childId: string,
  lessonTitle: string,
  correctCount: number,
  totalQuestions: number
): string[] => {
  if (!childId) return [];
  const progress = getChildProgress(childId);
  const newBadges: string[] = [];

  // Add lessonTitle to completed list if not already there
  if (!progress.completedLessons.includes(lessonTitle)) {
    progress.completedLessons.push(lessonTitle);
  }

  // Check 1: first_lesson
  if (progress.completedLessons.length >= 1 && !progress.earnedBadges.includes('first_lesson')) {
    progress.earnedBadges.push('first_lesson');
    newBadges.push('first_lesson');
  }

  // Check 2: three_lessons
  if (progress.completedLessons.length >= 3 && !progress.earnedBadges.includes('three_lessons')) {
    progress.earnedBadges.push('three_lessons');
    newBadges.push('three_lessons');
  }

  // Check 3: perfect_score
  const isPerfect = correctCount === totalQuestions && totalQuestions > 0;
  if (isPerfect && !progress.earnedBadges.includes('perfect_score')) {
    progress.earnedBadges.push('perfect_score');
    newBadges.push('perfect_score');
  }

  // Check 5: all_lessons
  // We have 8 lesson categories defined in LessonSelectPage
  if (progress.completedLessons.length >= 8 && !progress.earnedBadges.includes('all_lessons')) {
    progress.earnedBadges.push('all_lessons');
    newBadges.push('all_lessons');
  }

  if (newBadges.length > 0) {
    saveChildProgress(childId, progress);
  } else {
    // Save progress anyway for completedLessons list
    saveChildProgress(childId, progress);
  }

  return newBadges;
};

export const checkAndAwardChallengeBadge = (
  childId: string,
  challengeId: string
): string[] => {
  if (!childId) return [];
  const progress = getChildProgress(childId);
  const newBadges: string[] = [];

  if (!progress.completedChallenges.includes(challengeId)) {
    progress.completedChallenges.push(challengeId);
  }

  // Check 4: challenge_any (Balance scale or subitizing)
  if (
    (challengeId === 'balance-scale' || challengeId === 'subitizing') &&
    !progress.earnedBadges.includes('challenge_any')
  ) {
    progress.earnedBadges.push('challenge_any');
    newBadges.push('challenge_any');
  }

  // Check 6: monster_slayer (Defeated monster)
  if (challengeId === 'monster-challenge' && !progress.earnedBadges.includes('monster_slayer')) {
    progress.earnedBadges.push('monster_slayer');
    newBadges.push('monster_slayer');
  }

  if (newBadges.length > 0) {
    saveChildProgress(childId, progress);
  } else {
    saveChildProgress(childId, progress);
  }

  return newBadges;
};
