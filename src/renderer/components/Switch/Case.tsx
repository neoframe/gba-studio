import type { ReactElement, ReactNode } from 'react';

interface CaseProps {
  value?: string | number | (string | number)[];
  default?: boolean;
  children: ReactNode;
}

const Case = ({ value: _, children }: CaseProps): ReactNode =>
  children;

export default Case;

export type CaseNode = ReactElement<typeof Case> & {
  props: CaseProps;
};
