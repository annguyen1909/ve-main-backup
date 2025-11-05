import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import i18n from '~/i18n';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function __(
  key: string,
  attributes: { [n: string]: string | number } = {}
) {
  let value = key;

  Object.keys(attributes).forEach((attribute) => {
    value = value.replace(`:${attribute}`, attributes[attribute].toString());
  });

  return value;
}

export function title(title: string = '', withoutSuffix = false) {
  if (!title) return 'Visual Ennode';

  return withoutSuffix ? title : `${title} | Visual Ennode`;
}


export function localePath(locale: string, to: string) {
  let path = `/${locale}/${to.replace(/^\/|\/$/g, '')}`;

  if (locale === i18n.fallbackLng) {
    path = `/${to.replace(/^\/|\/$/g, '')}`;
  }

  return path.replace(/\/$/g, '').replace('//', '');
}
