import { PanelProps } from '@grafana/data';
import { createContext, useContext } from 'react';

import { PanelOptions } from '../types';

/**
 * Use Panel Props Context
 */
const panelPropsContext = createContext<PanelProps<PanelOptions>>({} as never);

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PanelPropsContextProvider = panelPropsContext.Provider;

/**
 * Use Panel Props Context
 */
export const usePanelPropsContext = () => {
  return useContext(panelPropsContext);
};
