import { createContext, useContext, useEffect, type Dispatch, type ReactNode, type SetStateAction } from "react";

export type EpcHeaderItem = {
  label: string;
  onClick?: () => void;
};

export type EpcHeaderConfig = {
  backFallbackTo: string;
  backLabel: string;
  breadcrumbs: EpcHeaderItem[];
};

const EpcHeaderContext = createContext<Dispatch<SetStateAction<EpcHeaderConfig | null>> | null>(null);

type EpcHeaderProviderProps = {
  children: ReactNode;
  value: Dispatch<SetStateAction<EpcHeaderConfig | null>>;
};

export function EpcHeaderProvider({ children, value }: EpcHeaderProviderProps) {
  return <EpcHeaderContext.Provider value={value}>{children}</EpcHeaderContext.Provider>;
}

export function useEpcHeader(config: EpcHeaderConfig | null) {
  const setHeader = useContext(EpcHeaderContext);

  useEffect(() => {
    if (!setHeader) {
      return;
    }

    setHeader(config);
    return () => setHeader(null);
  }, [config, setHeader]);
}
