import { useRouter } from "next/router"
import React from "react"
import Link from "next/link"

interface NavLinkProps {
  to: string
  children:
    | React.ReactNode
    | ((props: { isActive: boolean }) => React.ReactNode)
}

const NavLink = (props: NavLinkProps) => {
  const { pathname } = useRouter()
  const { to, children } = props
  const isActive = pathname == to

  return (
    <Link href={to}>
      {typeof children === "function" ? children({ isActive }) : children}
    </Link>
  )
}

export default NavLink
