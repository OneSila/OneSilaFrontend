export interface OnboardingCardObject {
  key: string;
  title: string;
  query: any;
  variables?: Record<string, any>;
  path: string;
  pathQuery?: Record<string, string>;
  pathParams?: Record<string, string>;
  dependencies?: string[];
  optional?: boolean;
}