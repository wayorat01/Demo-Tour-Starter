import Link from 'next/link'
import { Settings, LogIn } from 'lucide-react'

/**
 * Subtle admin link for the footer.
 * - Not logged in → shows lock icon + "เข้าสู่ระบบ" link to /admin
 * - Logged in → shows gear icon + "จัดการเว็บไซต์" link to /admin
 */
export function FooterAdminLink({
  isLoggedIn,
  className,
}: {
  isLoggedIn: boolean
  className?: string
}) {
  return (
    <Link
      href="/admin"
      className={
        className ||
        'text-muted-foreground/50 hover:text-muted-foreground inline-flex items-center gap-1 text-xs transition-colors duration-200'
      }
    >
      {isLoggedIn ? (
        <>
          <Settings className="size-3" />
          <span>จัดการเว็บไซต์</span>
        </>
      ) : (
        <>
          <LogIn className="size-3" />
          <span>เข้าสู่ระบบ</span>
        </>
      )}
    </Link>
  )
}
