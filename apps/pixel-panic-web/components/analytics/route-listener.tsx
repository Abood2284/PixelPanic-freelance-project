// apps/pixel-panic-web/components/analytics/route-listener.tsx
'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function AnalyticsRouteListener(): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const query = searchParams?.toString()
    const url = query ? `${pathname}?${query}` : pathname

    // Hotjar SPA navigation
    // @ts-expect-error vendor global
    if (typeof window !== 'undefined') window.hj?.('stateChange', url)

    // Contentsquare page tracking (safe no-op if absent)
    // @ts-expect-error vendor global
    if (typeof window !== 'undefined') window._uxa?.push?.(['trackPage'])
  }, [pathname, searchParams])

  return null
}


