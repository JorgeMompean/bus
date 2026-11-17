/**
 * Duotone SVG Icons Library
 * Clean, minimalist, scalable bi-color vector icons (zero emojis).
 */

const Icons = {
  bus: (size = 20) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="duo-s" d="M4 11V16C4 17.1046 4.89543 18 6 18V19.5C6 20.3284 6.67157 21 7.5 21H8.5C9.32843 21 10 20.3284 10 19.5V18H14V19.5C14 20.3284 14.6716 21 15.5 21H16.5C17.3284 21 18 20.3284 18 19.5V18C19.1046 18 20 17.1046 20 16V11H4Z" />
      <path class="duo-p" fill-rule="evenodd" clip-rule="evenodd" d="M4 8C4 5.79086 5.79086 4 8 4H16C18.2091 4 20 5.79086 20 8V11H4V8ZM7 8C7 7.44772 7.44772 7 8 7H16C16.5523 7 17 7.44772 17 8C17 8.55228 16.5523 9 16 9H8C7.44772 9 7 8.55228 7 8ZM7 15C7.55228 15 8 14.5523 8 14C8 13.4477 7.55228 13 7 13C6.44772 13 6 13.4477 6 14C6 14.5523 6.44772 15 7 15ZM18 14C18 14.5523 17.5523 15 17 15C16.4477 15 16 14.5523 16 14C16 13.4477 16.4477 13 17 13C17.5523 13 18 13.4477 18 14Z" />
    </svg>`,

  calendar: (size = 20) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="duo-s" d="M3 9H21V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V9Z" />
      <path class="duo-p" d="M19 4H5C3.89543 4 3 4.89543 3 6V9H21V6C21 4.89543 20.1046 4 19 4ZM8 2V5M16 2V5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="duo-stroke" />
      <circle cx="8" cy="13" r="1.2" class="duo-p" />
      <circle cx="12" cy="13" r="1.2" class="duo-p" />
      <circle cx="16" cy="13" r="1.2" class="duo-p" />
      <circle cx="8" cy="17" r="1.2" class="duo-p" />
      <circle cx="12" cy="17" r="1.2" class="duo-p" />
    </svg>`,

  ticket: (size = 20) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="duo-s" d="M3 6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V9C19.8954 9 19 9.89543 19 11C19 12.1046 19.8954 13 21 13V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V13C4.10457 13 5 12.1046 5 11C5 9.89543 4.10457 9 3 9V6Z" />
      <path class="duo-p" d="M10 7V17M14 7V17" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 3" class="duo-stroke" />
    </svg>`,

  sun: (size = 20) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="5" class="duo-s" />
      <circle cx="12" cy="12" r="3.5" class="duo-p" />
      <path d="M12 2V4M12 20V22M4 12H2M22 12H20M5.636 5.636L7.05 7.05M16.95 16.95L18.364 18.364M5.636 18.364L7.05 16.95M16.95 7.05L18.364 5.636" stroke-width="2" stroke-linecap="round" class="duo-stroke" />
    </svg>`,

  moon: (size = 20) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="duo-s" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      <path class="duo-p" d="M19.5 10.5A7.5 7.5 0 0 1 13.5 16.5A7.5 7.5 0 0 1 11.21 3C11.14 3.32 11.1 3.65 11.1 4A8 8 0 0 0 19.1 12C19.45 12 19.78 11.96 20.1 11.89C19.92 11.41 19.71 10.94 19.5 10.5Z" />
    </svg>`,

  chevronLeft: (size = 18) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="duo-stroke" d="M15 18L9 12L15 6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`,

  chevronRight: (size = 18) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="duo-stroke" d="M9 18L15 12L9 6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`,

  checkCircle: (size = 20) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" class="duo-s" />
      <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="duo-stroke" />
    </svg>`,

  alertTriangle: (size = 20) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="duo-s" d="M12 3L2 20H22L12 3Z" />
      <path d="M12 9V13M12 16.5V17" stroke-width="2" stroke-linecap="round" class="duo-stroke" />
    </svg>`,

  cart: (size = 20) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="duo-s" d="M6 7H20L18.5 14H7.5L6 7Z" />
      <circle cx="9" cy="19" r="1.5" class="duo-p" />
      <circle cx="17" cy="19" r="1.5" class="duo-p" />
      <path d="M3 3H5L6 7M6 7L7.5 14H18.5L20 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="duo-stroke" />
    </svg>`,

  plus: (size = 16) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5V19M5 12H19" stroke-width="2.5" stroke-linecap="round" class="duo-stroke" />
    </svg>`,

  minus: (size = 16) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12H19" stroke-width="2.5" stroke-linecap="round" class="duo-stroke" />
    </svg>`,

  close: (size = 18) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="duo-stroke" />
    </svg>`,

  refresh: (size = 18) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="duo-s" d="M12 4V1L8 5L12 9V6C15.31 6 18 8.69 18 12C18 13.01 17.75 13.97 17.3 14.8L18.8 16.3C19.56 15.05 20 13.58 20 12C20 7.58 16.42 4 12 4Z" />
      <path class="duo-p" d="M12 20C8.69 20 6 17.31 6 12C6 10.99 6.25 10.03 6.7 9.2L5.2 7.7C4.44 8.95 4 10.42 4 12C4 16.42 7.58 20 12 20V23L16 19L12 15V20Z" />
    </svg>`,

  settings: (size = 18) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" class="duo-p" />
      <path class="duo-s" d="M19.4 15A1.65 1.65 0 0 0 19.73 16.82L19.82 16.92C20.21 17.31 20.21 17.94 19.82 18.33L18.33 19.82C17.94 20.21 17.31 20.21 16.92 19.82L16.82 19.73A1.65 1.65 0 0 0 15 19.4A1.65 1.65 0 0 0 13.8 20.93L13.75 21.07C13.6 21.6 13.12 22 12.56 22H11.44C10.88 22 10.4 21.6 10.25 21.07L10.2 20.93A1.65 1.65 0 0 0 9 19.4A1.65 1.65 0 0 0 7.18 19.73L7.08 19.82C6.69 20.21 6.06 20.21 5.67 19.82L4.18 18.33C3.79 17.94 3.79 17.31 4.18 16.92L4.27 16.82A1.65 1.65 0 0 0 4.6 15A1.65 1.65 0 0 0 3.07 13.8L2.93 13.75C2.4 13.6 2 13.12 2 12.56V11.44C2 10.88 2.4 10.4 2.93 10.25L3.07 10.2A1.65 1.65 0 0 0 4.6 9A1.65 1.65 0 0 0 4.27 7.18L4.18 7.08C3.79 6.69 3.79 6.06 4.18 5.67L5.67 4.18C6.06 3.79 6.69 3.79 7.08 4.18L7.18 4.27A1.65 1.65 0 0 0 9 4.6A1.65 1.65 0 0 0 10.2 3.07L10.25 2.93C10.4 2.4 10.88 2 11.44 2H12.56C13.12 2 13.6 2.4 13.75 2.93L13.8 3.07A1.65 1.65 0 0 0 15 4.6A1.65 1.65 0 0 0 16.82 4.27L16.92 4.18C17.31 3.79 17.94 3.79 18.33 4.18L19.82 5.67C20.21 6.06 20.21 6.69 19.82 7.08L19.73 7.18A1.65 1.65 0 0 0 19.4 9A1.65 1.65 0 0 0 20.93 10.2L21.07 10.25C21.6 10.4 22 10.88 22 11.44V12.56C22 13.12 21.6 13.6 21.07 13.75L20.93 13.8A1.65 1.65 0 0 0 19.4 15Z" />
    </svg>`,

  sparkles: (size = 18) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="duo-p" d="M12 2L14.2 8.8L21 11L14.2 13.2L12 20L9.8 13.2L3 11L9.8 8.8L12 2Z" />
      <path class="duo-s" d="M19 16L20 19L23 20L20 21L19 24L18 21L15 20L18 19L19 16Z" />
    </svg>`,

  cloudSync: (size = 18) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="duo-s" d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04Z" />
      <path class="duo-p" d="M12 9V12L14 10M12 15V12L10 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="duo-stroke" />
      <path class="duo-p" d="M15 12A3 3 0 1 1 9 12A3 3 0 0 1 15 12Z" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 3" class="duo-stroke" />
    </svg>`,

  link: (size = 18) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="duo-s" d="M10 13A5 5 0 0 0 17.07 13L20.07 10A5 5 0 0 0 13 2.93L11.5 4.43" />
      <path class="duo-p" d="M14 11A5 5 0 0 0 6.93 11L3.93 14A5 5 0 0 0 11 21.07L12.5 19.57" stroke-width="2" stroke-linecap="round" class="duo-stroke" />
      <path d="M8.5 15.5L15.5 8.5" stroke-width="2" stroke-linecap="round" class="duo-stroke" />
    </svg>`,

  share: (size = 18) => `
    <svg class="duotone-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="5" r="3" class="duo-s" />
      <circle cx="6" cy="12" r="3" class="duo-s" />
      <circle cx="18" cy="19" r="3" class="duo-s" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke-width="2" class="duo-stroke" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke-width="2" class="duo-stroke" />
    </svg>`
};

