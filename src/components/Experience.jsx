import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { experience, themes } from '../data.js'
import { ChevronRightIcon, iconMap } from './icons.jsx'
import { iconRenders } from '../renders.js'
import JobModal from './JobModal.jsx'
import { fadeUp, viewportOnce } from '../motion.js'

const filters = [
  { id: 'all', label: 'All' },
  { id: 'frontend', label: 'Dev' },
  { id: 'design', label: 'Design' },
  { id: 'analysis', label: 'Analysis' },
]

const VISIBLE_COUNT = 4

const cardMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

export default function Experience() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [expanded, setExpanded] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)

  const filteredJobs =
    activeFilter === 'all' ? experience : experience.filter((job) => job.categories.includes(activeFilter))
  const displayedJobs = expanded ? filteredJobs : filteredJobs.slice(0, VISIBLE_COUNT)
  const hiddenCount = filteredJobs.length - displayedJobs.length

  function selectFilter(id) {
    setActiveFilter(id)
    setExpanded(false)
  }

  return (
    <section id="experience" className="section experience">
      <div className="container">
        <motion.p
          className="section__eyebrow section__eyebrow--center"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          03 — Career
        </motion.p>
        <motion.h2
          className="section__heading section__heading--center"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          Experience
        </motion.h2>

        <motion.div
          className="experience__filters"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`experience__filter ${activeFilter === filter.id ? 'is-active' : ''}`}
              onClick={() => selectFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          className="experience__list"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <AnimatePresence initial={false}>
            {displayedJobs.map((job) => {
              const theme = themes[job.theme] ?? themes.default
              const Icon = iconMap[job.icon]
              const render = iconRenders[job.icon]
              return (
                <motion.button
                  key={job.id}
                  layout
                  {...cardMotion}
                  className="job-card"
                  onClick={() => setSelectedJob(job)}
                  aria-haspopup="dialog"
                >
                  <span className="job-card__main">
                    <span
                      className="job-card__icon"
                      style={{ '--job-tint': theme.badgeBg, '--job-color': theme.primary }}
                    >
                      {render ? (
                        <img src={render} alt="" width="52" height="52" loading="lazy" />
                      ) : (
                        Icon && <Icon size={24} color={theme.primary} />
                      )}
                    </span>
                    <span className="job-card__text">
                      <span className="job-card__role">{job.role}</span>
                      <span className="job-card__meta">
                        {job.company} · {job.period}
                      </span>
                    </span>
                  </span>
                  {job.current && (
                    <span
                      className="job-card__tag"
                      style={{ background: theme.badgeBg, color: theme.badgeText }}
                    >
                      CURRENT
                    </span>
                  )}
                  <span className="job-card__chevron">
                    <ChevronRightIcon size={18} />
                  </span>
                </motion.button>
              )
            })}
          </AnimatePresence>

          {(hiddenCount > 0 || expanded) && filteredJobs.length > VISIBLE_COUNT && (
            <button className="experience__toggle" onClick={() => setExpanded((v) => !v)}>
              {expanded ? 'Show fewer roles' : `Show ${hiddenCount} earlier roles`}
            </button>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedJob && <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
      </AnimatePresence>
    </section>
  )
}
