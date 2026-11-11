import { motion } from 'motion/react'
import { BadgeCheck, CircleDashed, Factory, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { fadeUp, PageHeader, SourceLink, stagger } from '../components/ui'
import { COMPANY } from '../data/company'
import { CERTIFICATIONS, PLANTS } from '../data/plants'

const TYPE_STYLE = {
  dairy: { label: 'Mother Dairy', cls: 'bg-md-sky-50 text-md-sky-ink', bar: 'bg-md-sky' },
  safal: { label: 'Safal', cls: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500' },
  dhara: { label: 'Dhara', cls: 'bg-amber-50 text-amber-700', bar: 'bg-amber-500' },
  office: { label: 'Office', cls: 'bg-indigo-50 text-indigo-700', bar: 'bg-md-navy' },
  port: { label: 'Port', cls: 'bg-slate-100 text-slate-700', bar: 'bg-slate-400' },
}

export default function Network() {
  return (
    <>
      <PageHeader
        eyebrow="Approved details"
        title="Plants & Certifications"
        subtitle="Manufacturing sites and the certifications published on motherdairy.com. Expiry dates are not published, so they are marked “to confirm” until QA uploads the current certificates."
      />

      <motion.div variants={stagger} className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PLANTS.map((p) => {
          const t = TYPE_STYLE[p.type]
          return (
            <motion.div key={p.id} variants={fadeUp} whileHover={{ y: -3 }} className="card relative overflow-hidden p-5">
              <div className={`absolute inset-x-0 top-0 h-1 ${t.bar}`} />
              <div className="flex items-start justify-between gap-2">
                <span className={`chip ${t.cls}`}>{t.label}</span>
                <span className={`chip ${p.status === 'operational' ? 'bg-emerald-50 text-emerald-700' : p.status === 'commissioning' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                  {p.status === 'operational' ? <BadgeCheck className="h-3 w-3" /> : <CircleDashed className="h-3 w-3" />} {p.status}
                </span>
              </div>
              <h3 className="mt-2 flex items-center gap-2 text-lg font-bold text-md-navy-900">
                <Factory className="h-4 w-4 text-slate-400" /> {p.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5" /> {p.city}, {p.state}
              </div>
              <p className="mt-2 text-sm text-slate-600">{p.summary}</p>
              {p.certifications.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.certifications.map((c) => (
                    <span key={c} className="chip bg-white text-slate-700 ring-1 ring-slate-200">
                      <ShieldCheck className="h-3 w-3 text-md-teal-ink" /> {c}
                    </span>
                  ))}
                </div>
              )}
              {p.source && (
                <div className="mt-3">
                  <SourceLink href={p.source}>Source</SourceLink>
                </div>
              )}
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <motion.section variants={fadeUp} className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <h3 className="font-bold text-md-navy-900">Certification register</h3>
            <SourceLink href="https://www.motherdairy.com/Category/certifications">motherdairy.com/certifications</SourceLink>
          </div>
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Certification</th>
                  <th className="px-4 py-2.5">Site</th>
                  <th className="px-4 py-2.5">Scope</th>
                  <th className="px-4 py-2.5">Validity</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {CERTIFICATIONS.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 font-semibold text-md-navy-900">{c.name}</td>
                    <td className="px-4 py-2.5 text-slate-600">{c.site}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{c.scope}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{c.validTill}</td>
                    <td className="px-4 py-2.5">
                      {c.verified ? (
                        <span className="chip bg-emerald-50 text-emerald-700">
                          <BadgeCheck className="h-3 w-3" /> Published
                        </span>
                      ) : (
                        <span className="chip bg-amber-50 text-amber-700">Internal – verify</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="card h-fit space-y-4 p-5">
          <h3 className="font-bold text-md-navy-900">Export contacts</h3>
          <div className="rounded-xl bg-md-sky-50 p-3 text-sm">
            <div className="font-bold text-md-navy-900">Export Office</div>
            <div className="text-slate-600">{COMPANY.exportOffice.address}</div>
            <div className="mt-2 space-y-1 text-slate-700">
              <a className="flex items-center gap-1.5 hover:underline" href={`mailto:${COMPANY.exportOffice.email}`}>
                <Mail className="h-3.5 w-3.5" /> {COMPANY.exportOffice.email}
              </a>
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {COMPANY.exportOffice.phone}
              </div>
              <div className="text-xs text-slate-500">Fax {COMPANY.exportOffice.fax}</div>
            </div>
          </div>
          {COMPANY.contacts.map((c) => (
            <div key={c.email} className="rounded-xl p-3 text-sm ring-1 ring-slate-200">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{c.role}</div>
              <div className="font-semibold text-slate-800">{c.name}</div>
              <a className="block text-md-sky-ink hover:underline" href={`mailto:${c.email}`}>
                {c.email}
              </a>
              <div className="text-slate-500">{c.phone}</div>
            </div>
          ))}
          <SourceLink href="https://www.motherdairy.com/branddetails/18/4">Published export contacts</SourceLink>
        </motion.section>
      </div>
    </>
  )
}
