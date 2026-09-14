import { skills } from '../data.js'

export default function Skills() {
  return (
    <section id="skills" className="section skills">
      <div className="container">
        <h2 className="section__heading">Skills</h2>
        <ul className="skills__grid">
          {skills.map((skill) => (
            <li key={skill} className="skills__item">
              {skill}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
