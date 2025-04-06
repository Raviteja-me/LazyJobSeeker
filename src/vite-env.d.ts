/// <reference types="vite/client" />

declare module '*.tsx' {
  const content: any;
  export default content;
}

declare module '@dotlottie/player-component';