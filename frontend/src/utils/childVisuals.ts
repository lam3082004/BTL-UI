import { Child, EnabledLesson, LessonActivity, MathOperation } from '../types';

export interface ChildVisual {
  avatar: string;
  color: string;
  softColor: string;
  doorClass: string;
}

const visuals: ChildVisual[] = [
  { avatar: '🐻', color: '#FFD39A', softColor: '#FFF3DF', doorClass: 'door-orange' },
  { avatar: '🐰', color: '#9DD9E8', softColor: '#EAF8FB', doorClass: 'door-blue' },
  { avatar: '🐱', color: '#9DE8D0', softColor: '#EAFBF5', doorClass: 'door-green' },
  { avatar: '⭐', color: '#F7A6B8', softColor: '#FFF0F4', doorClass: 'door-pink' },
  { avatar: '🦊', color: '#FFD39A', softColor: '#FFF3DF', doorClass: 'door-orange' },
  { avatar: '🐼', color: '#9DD9E8', softColor: '#EAF8FB', doorClass: 'door-blue' },
];

export const getChildVisual = (child?: Pick<Child, 'name' | 'avatar'> | null, index = 0): ChildVisual => {
  if (child?.avatar) {
    return { ...visuals[index % visuals.length], avatar: child.avatar };
  }

  if (child?.name?.includes('Thỏ')) return visuals[1];
  if (child?.name?.includes('Bi')) return visuals[2];
  if (child?.name?.includes('Sao')) return visuals[3];
  if (child?.name?.includes('Bo')) return visuals[0];

  return visuals[index % visuals.length];
};

export const getStoredChild = (): Child | null => {
  const value = sessionStorage.getItem('selectedChild');
  if (!value) return null;

  try {
    return normalizeChildConfig(JSON.parse(value) as Child);
  } catch {
    return null;
  }
};

export const demoChildren: Child[] = [
  { id: 'demo-bo', name: 'Bé Bo', avatar: '🐻', minNumber: 1, maxNumber: 10, allowedOperations: [LessonActivity.COUNTING, MathOperation.ADDITION] },
  { id: 'demo-tho', name: 'Bé Thỏ', avatar: '🐰', minNumber: 1, maxNumber: 10, allowedOperations: [LessonActivity.COUNTING, MathOperation.ADDITION, MathOperation.SUBTRACTION] },
  { id: 'demo-bi', name: 'Bé Bi', avatar: '🐱', minNumber: 1, maxNumber: 10, allowedOperations: [LessonActivity.COUNTING, MathOperation.ADDITION] },
  { id: 'demo-sao', name: 'Bé Sao', avatar: '⭐', minNumber: 1, maxNumber: 10, allowedOperations: [LessonActivity.COUNTING, MathOperation.ADDITION] },
];

const localChildrenKey = 'numsenseLocalChildren';
const countPreferencePrefix = 'numsenseCountingEnabled:';

export const maxVisualNumber = 12;

const mathOperations = Object.values(MathOperation) as string[];

export const isMathOperation = (value: EnabledLesson): value is MathOperation => mathOperations.includes(value);

export const normalizeAllowedLessons = (allowedOperations?: EnabledLesson[], childId?: string): EnabledLesson[] => {
  const configured = allowedOperations?.length ? allowedOperations : [LessonActivity.COUNTING, MathOperation.ADDITION];
  const countingPreference = childId ? localStorage.getItem(`${countPreferencePrefix}${childId}`) : null;
  const includeCounting = countingPreference === null ? configured.includes(LessonActivity.COUNTING) || Boolean(childId) : countingPreference === 'true';
  const next: EnabledLesson[] = configured.filter((item) => item !== LessonActivity.COUNTING);

  if (includeCounting) {
    next.unshift(LessonActivity.COUNTING);
  }

  return Array.from(new Set(next));
};

export const normalizeChildConfig = (child: Child): Child => {
  const minNumber = Number.isFinite(child.minNumber) ? child.minNumber : 1;
  const maxNumber = Number.isFinite(child.maxNumber) ? child.maxNumber : 10;
  const safeMin = Math.max(1, Math.min(maxVisualNumber, Math.min(minNumber, maxNumber)));
  const safeMax = Math.max(safeMin, Math.min(maxVisualNumber, Math.max(minNumber, maxNumber)));

  return {
    ...child,
    minNumber: safeMin,
    maxNumber: safeMax,
    allowedOperations: normalizeAllowedLessons(child.allowedOperations, child.id),
  };
};

export const rememberCountingPreference = (childId: string, enabledLessons: EnabledLesson[]) => {
  localStorage.setItem(`${countPreferencePrefix}${childId}`, String(enabledLessons.includes(LessonActivity.COUNTING)));
};

export const toBackendOperations = (enabledLessons: EnabledLesson[]): MathOperation[] => {
  const operations = enabledLessons.filter(isMathOperation);
  return operations.length ? operations : [MathOperation.ADDITION];
};

export const getLocalChildren = (): Child[] => {
  const saved = localStorage.getItem(localChildrenKey);
  if (!saved) return demoChildren.map(normalizeChildConfig);

  try {
    const children = JSON.parse(saved) as Child[];
    return (children.length ? children : demoChildren).map(normalizeChildConfig);
  } catch {
    return demoChildren.map(normalizeChildConfig);
  }
};

export const setLocalChildren = (children: Child[]) => {
  localStorage.setItem(localChildrenKey, JSON.stringify(children.map(normalizeChildConfig)));
};

export const upsertLocalChild = (child: Child) => {
  const normalizedChild = normalizeChildConfig(child);
  const children = getLocalChildren();
  const exists = children.some((item) => item.id === normalizedChild.id);
  const next = exists ? children.map((item) => (item.id === normalizedChild.id ? normalizedChild : item)) : [...children, normalizedChild];
  setLocalChildren(next);
  return next;
};

export const getLocalChildById = (childId?: string): Child | null =>
  getLocalChildren().find((child) => child.id === childId) || null;
