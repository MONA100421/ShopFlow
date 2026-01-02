cat > (src / vite - env.d.ts) << "EOF";
/// <reference types="vite/client" />
/// <reference types="vite/client" />

declare module "*.svg" {
  const src: string;
  export default src;
}
