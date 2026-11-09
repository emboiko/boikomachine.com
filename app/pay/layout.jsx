import { PayShell } from '@/components/pay/PayShell'

export const metadata = {
  title: 'Pay invoice',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/pay',
  },
}

export default function PayLayout({ children }) {
  return <PayShell>{children}</PayShell>
}
