// RootNavigation.ts
import { createRef } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';

export interface ExtendedNavigationContainerRef extends NavigationContainerRef<any> {
  replace(name: string, params?: any): void;
}

export const navigationRef = createRef<ExtendedNavigationContainerRef>();

export function navigate(name: string, params?: any) {
  navigationRef.current?.navigate(name, params);
}

export function replace(name: string, params?: any) {
  navigationRef.current?.replace(name, params);
}
