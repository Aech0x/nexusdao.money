import Link from "next/link"
import Image from "next/image"
import NavLink from "./NavLink"

import React from "react"
import { Dialog, Transition } from "@headlessui/react"
import { useDispatch, useSelector } from "react-redux"
import { setSidebarState } from "../slices/app"
import { RootState } from "../store"

import {
  ViewGridIcon,
  ClockIcon,
  CubeIcon,
  SparklesIcon,
  ShoppingBagIcon,
  LibraryIcon,
  DocumentTextIcon,
  ExternalLinkIcon
} from "@heroicons/react/outline"

import {
  faMedium,
  faDiscord,
  faGithub,
  faTwitter
} from "@fortawesome/free-brands-svg-icons"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const sidebarData = {
  routes: [
    { title: "Dashboard", icon: ViewGridIcon, to: "/dashboard" },
    { title: "Presale", icon: ClockIcon, to: "/presale" },
    { title: "Nodes", icon: CubeIcon, to: "/nodes" },
    { title: "Reflections", icon: SparklesIcon, to: "/reflections" },
    { title: "Marketplace", icon: ShoppingBagIcon, to: "/marketplace" }
  ],
  links: [
    {
      title: "Governance",
      icon: LibraryIcon,
      to: "https://snapshot.org/#/nexusdao.eth"
    },
    {
      title: "Docs",
      icon: DocumentTextIcon,
      to: "https://nexusdao.gitbook.io"
    }
  ],
  socials: [
    {
      link: "https://twitter.com/NexusDAODeFi",
      title: "Twitter",
      icon: faTwitter
    },
    {
      link: "https://medium.com/@NexusDAODeFi",
      title: "Medium",
      icon: faMedium
    },
    {
      link: "https://discord.gg/NexusDAO",
      title: "Discord",
      icon: faDiscord
    },
    {
      ink: "https://github.com/NexusDAODeFi",
      title: "Github",
      icon: faGithub
    }
  ]
}

function Content() {
  const dispatch = useDispatch()

  return (
    <div className="flex flex-col shrink-0 min-h-screen justify-between p-8 bg-white w-72 drop-shadow-lg">
      <div className="flex flex-col">
        <Link href="/">
          <a className="flex flex-col items-center group">
            <Image
              src="/nexus.svg"
              alt="Nexus DAO Logo"
              width={128}
              height={128}
            />
            <span className="text-3xl font-bold group-hover:text-blue-700">
              Nexus DAO
            </span>
          </a>
        </Link>
        <div className="flex flex-col gap-y-4 mt-12">
          {sidebarData.routes.map((item, i) => {
            return (
              <NavLink to={item.to} key={i}>
                {({ isActive }) => (
                  <a
                    className="flex items-center gap-x-2 group"
                    onClick={() => {
                      dispatch(setSidebarState(false))
                    }}
                  >
                    <item.icon
                      className={
                        isActive
                          ? "h-6 w-6"
                          : "h-6 w-6 group-hover:text-blue-700"
                      }
                    />
                    <span
                      className={`text-lg font-semibold ${
                        isActive
                          ? "underline underline-offset-2"
                          : "group-hover:text-blue-700"
                      }`}
                    >
                      {item.title}
                    </span>
                  </a>
                )}
              </NavLink>
            )
          })}

          {sidebarData.links.map((item, i) => {
            return (
              <Link href={item.to} key={i}>
                <a
                  className="flex items-center gap-x-2 group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <item.icon className="h-6 w-6 group-hover:text-blue-700" />
                  <span className="text-lg font-semibold group-hover:text-blue-700">
                    {item.title}
                  </span>
                  <ExternalLinkIcon className="h-5 w-5 invisible group-hover:visible text-blue-700" />
                </a>
              </Link>
            )
          })}
        </div>
      </div>
      <div className="flex justify-center gap-x-8 mt-12">
        {sidebarData.socials.map((item, i) => {
          return (
            <a
              href={item.link}
              rel="noopener noreferrer"
              target="_blank"
              className="hover:text-blue-700 w-6 h-6 flex items-center"
              title={item.title}
              key={i}
            >
              <FontAwesomeIcon icon={item.icon} size="lg" />
            </a>
          )
        })}
      </div>
    </div>
  )
}

function Sidebar() {
  const dispatch = useDispatch()
  const isSidebarOpen = useSelector(
    (state: RootState) => state.app.isSidebarOpen
  )

  return (
    <>
      <div className="hidden lg:block">
        <Content />
      </div>
      <Transition.Root show={isSidebarOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed z-0 inset-0 overflow-y-auto lg:hidden"
          //   initialFocus={null}
          onClose={(value: boolean) => {
            dispatch(setSidebarState(value))
          }}
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <Transition.Child
            as="div"
            enter="ease-out transition duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in transition duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Content />
          </Transition.Child>
        </Dialog>
      </Transition.Root>
    </>
  )
}

export default Sidebar
