/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ARK_API_KEY?: string;
  readonly VITE_ARK_MODEL?: string;
  readonly VITE_ARK_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
