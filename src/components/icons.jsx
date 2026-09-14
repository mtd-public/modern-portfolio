function Svg({ size = 24, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
      {children}
    </svg>
  )
}

export function GraduationCapIcon({ size, color = 'currentColor' }) {
  return (
    <Svg size={size} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
    </Svg>
  )
}

export function ShieldCheckIcon({ size, color = 'currentColor' }) {
  return (
    <Svg size={size} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m7 15 4-4 3 3 5-6" />
    </Svg>
  )
}

export function NetworkIcon({ size, color = 'currentColor' }) {
  return (
    <Svg size={size} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 4.3l.06.06A1.65 1.65 0 0 0 8.92 4.7 1.65 1.65 0 0 0 10 3.18V3a2 2 0 1 1 4 0v.09c0 .68.39 1.29 1 1.51.62.25 1.33.12 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.45.49-.58 1.2-.33 1.82.22.61.83 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.68 0-1.29.39-1.51 1Z" />
    </Svg>
  )
}

export function CodeBracketsIcon({ size, color = 'currentColor' }) {
  return (
    <Svg size={size} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 16 4-4-4-4" />
      <path d="m6 8-4 4 4 4" />
      <path d="m14.5 4-5 16" />
    </Svg>
  )
}

export function CheckBadgeIcon({ size, color = 'currentColor' }) {
  return (
    <Svg size={size} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  )
}

export const iconMap = {
  graduationCap: GraduationCapIcon,
  shieldCheck: ShieldCheckIcon,
  network: NetworkIcon,
  codeBrackets: CodeBracketsIcon,
  checkBadge: CheckBadgeIcon,
}

export function ChevronRightIcon({ size, color = 'currentColor' }) {
  return (
    <Svg size={size} stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="m9 6 6 6-6 6" />
    </Svg>
  )
}

export function CloseIcon({ size, color = 'currentColor' }) {
  return (
    <Svg size={size} stroke={color} strokeWidth="2.4" strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  )
}

export function GithubIcon({ size, color = 'currentColor' }) {
  return (
    <Svg size={size} fill={color}>
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.53 9.53 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .26.18.57.69.48A10 10 0 0 0 12 2Z" />
    </Svg>
  )
}

export function MailIcon({ size, color = 'currentColor' }) {
  return (
    <Svg size={size} stroke={color} strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Svg>
  )
}

export function MenuIcon({ size, color = 'currentColor' }) {
  return (
    <Svg size={size} stroke={color} strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </Svg>
  )
}
