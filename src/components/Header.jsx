import { useState } from 'react'
import { profile } from '../data.js'
import { GithubIcon, MailIcon, MenuIcon, CloseIcon } from './icons.jsx'

const links = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="site-header__bar container">
        <div className="site-header__brand-group">
          <a href="#top" className="site-header__brand">
            {profile.name}
          </a>
          <a href={profile.github} className="site-header__meta-link" target="_blank" rel="noreferrer">
            <GithubIcon size={16} />
            Github
          </a>
          <a href={`mailto:${profile.email}`} className="site-header__meta-link site-header__meta-link--muted">
            <MailIcon size={16} />
            {profile.email}
          </a>
        </div>

        <nav className="site-header__nav site-header__nav--desktop">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <button
          className="site-header__toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      <nav className={`site-header__nav site-header__nav--mobile ${open ? 'is-open' : ''}`}>
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
        <div className="site-header__nav-divider" />
        <a href={profile.github} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
          <GithubIcon size={18} /> Github
        </a>
        <a href={`mailto:${profile.email}`} onClick={() => setOpen(false)}>
          <MailIcon size={18} /> {profile.email}
        </a>
      </nav>
    </header>
  )
}
