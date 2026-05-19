import { Child, MathOperation } from '../types';

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
    return JSON.parse(value) as Child;
  } catch {
    return null;
  }
};

export const demoChildren: Child[] = [
  { id: 'demo-bo', name: 'Bé Bo', avatar: '🐻', minNumber: 1, maxNumber: 10, allowedOperations: [MathOperation.ADDITION] },
  { id: 'demo-tho', name: 'Bé Thỏ', avatar: '🐰', minNumber: 1, maxNumber: 10, allowedOperations: [MathOperation.ADDITION, MathOperation.SUBTRACTION] },
  { id: 'demo-bi', name: 'Bé Bi', avatar: '🐱', minNumber: 1, maxNumber: 10, allowedOperations: [MathOperation.ADDITION] },
  { id: 'demo-sao', name: 'Bé Sao', avatar: '⭐', minNumber: 1, maxNumber: 10, allowedOperations: [MathOperation.ADDITION] },
];

const localChildrenKey = 'numsenseLocalChildren';

export const getLocalChildren = (): Child[] => {
  const saved = localStorage.getItem(localChildrenKey);
  if (!saved) return demoChildren;

  try {
    const children = JSON.parse(saved) as Child[];
    return children.length ? children : demoChildren;
  } catch {
    return demoChildren;
  }
};

export const setLocalChildren = (children: Child[]) => {
  localStorage.setItem(localChildrenKey, JSON.stringify(children));
};

export const upsertLocalChild = (child: Child) => {
  const children = getLocalChildren();
  const exists = children.some((item) => item.id === child.id);
  const next = exists ? children.map((item) => (item.id === child.id ? child : item)) : [...children, child];
  setLocalChildren(next);
  return next;
};

export const getLocalChildById = (childId?: string): Child | null =>
  getLocalChildren().find((child) => child.id === childId) || null;
