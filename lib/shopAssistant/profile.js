import { BUSINESS, CAPABILITIES, SERVICE_AREAS, SERVICES } from '@/lib/constants'

export const SHOP_PROFILE_SECTIONS = [
  {
    id: 'identity',
    visibility: 'public',
    text: `${BUSINESS.name} is a custom machining, repair, and tooling shop based in ${BUSINESS.location}. Phone ${BUSINESS.phone}. Email ${BUSINESS.email}. The shop serves customers throughout New England and beyond.`,
  },
  {
    id: 'services',
    visibility: 'public',
    text: `Services: ${SERVICES.join('; ')}. The shop focuses on one-off parts, repair work, prototypes, tooling, and fixtures. Work is performed primarily on manual equipment, with attention to fit and finish.`,
  },
  {
    id: 'capabilities',
    visibility: 'public',
    text: CAPABILITIES.join('. '),
  },
  {
    id: 'equipment',
    visibility: 'public',
    text: 'Milling is done on a Series 1 2J 2HP Bridgeport. Turning is done on a Romi/DoAll 13 inch lathe with 3-jaw and 4-jaw chucks and a large collet selection. A Harig surface grinder is used to shape special cutters and tools. Welding is primarily SMAW on thicker mild steel and stainless. Several FDM 3D printers make prototypes, end-use parts, and mailed test fits.',
  },
  {
    id: 'materials',
    visibility: 'public',
    text: 'Common materials include aluminum, steel, brass, bronze, Delrin, UHMW, and other engineering plastics.',
  },
  {
    id: 'service-area',
    visibility: 'public',
    text: `Service area: ${SERVICE_AREAS.join('; ')}.`,
  },
  {
    id: 'stud-extraction',
    visibility: 'public',
    text: 'Broken stud extraction is offered on loose parts only.',
  },
  {
    id: 'files',
    visibility: 'public',
    text: 'Visitors can attach photos and drawings in this chat. JPG, PNG, WebP, HEIC, PDF, STEP, DXF, and SLA files are accepted. Attached files are saved with the inquiry. The assistant cannot see inside the files.',
  },
  {
    id: 'shop-scale',
    visibility: 'public',
    text: 'This is a small manual shop, not a heavy industrial one. Milled and turned work should be a plausible fit for the Bridgeport and the 13 inch lathe. A part that would not fit through a common household doorway is too large to mill here. Highly contoured parts, with curves and features that suit a CNC and are awkward on a manual machine, may not be a fit. Say that plainly and still offer to submit the request. Do not refuse the job yourself.',
  },
  {
    id: 'printed-fits',
    visibility: 'public',
    text: 'When cost, distance, or uncertain measurements make a first metal part a poor start, the shop is often glad to 3D print a test piece, mail it, and iterate the fit. That path suits someone who cannot measure a shaft or bore precisely. After the printed part fits, the shop can machine the real quantity in the requested material, such as 4140. Offer this when it helps. Do not bolt it onto every simple repair.',
  },
  {
    id: 'internal-notes',
    visibility: 'internal',
    text: 'For milling and turning, lean toward not feasible when the part is far too large for the Bridgeport or the 13 inch lathe, or when the geometry is mostly compound curves and CNC-style features a manual machine struggles to cut. A milling job that would not pass through a household doorway is too big. Photos only support that judgment when scale is visible, such as a hand, a bench, or a doorway. Do not invent inch dimensions from a photo. SMAW on thicker mild and stainless is the welding the shop actually does. 3D printed test fits are a preferred way to win work when the customer cannot supply reliable measurements.',
  },
]

export const publicProfileSections = () => {
  return SHOP_PROFILE_SECTIONS.filter((section) => {
    return section.visibility === 'public'
  })
}

export const formatProfileSections = (sections) => {
  const filledSections = sections.filter((section) => {
    return section.text.trim().length > 0
  })

  return filledSections
    .map((section) => {
      return `${section.id}\n${section.text.trim()}`
    })
    .join('\n\n')
}
