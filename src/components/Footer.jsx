import { profile } from '../data.js'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p>
          &copy; {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
        <p className="site-footer__note">3D illustrations modelled in Blender, rendered with three.js.</p>
      </div>
    </footer>
  )
}
