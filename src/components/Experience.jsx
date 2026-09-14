import { experience } from '../data.js'

export default function Experience() {
  return (
    <section id="experience" className="section experience">
      <div className="container">
        <h2 className="section__heading">Experience</h2>
        <ol className="timeline">
          {experience.map((job, idx) => (
            <li className="timeline__item" key={`${job.company}-${job.period}-${idx}`}>
              <div className="timeline__marker" aria-hidden="true" />
              <div className="timeline__content">
                <h3 className="timeline__role">{job.role}</h3>
                <p className="timeline__meta">
                  <span className="timeline__company">{job.company}</span>
                  <span className="timeline__period">{job.period}</span>
                </p>
                {job.location && <p className="timeline__location">{job.location}</p>}
                {job.bullets.length > 0 && (
                  <ul className="timeline__bullets">
                    {job.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
