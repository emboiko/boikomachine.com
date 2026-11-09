import { PayShell } from '@/components/pay/PayShell'

export const metadata = {
  title: 'Quote',
  robots: {
    index: false,
    follow: false,
  },
}

export default function QuoteLayout({ children }) {
  return <PayShell>{children}</PayShell>
}
