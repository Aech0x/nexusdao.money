import React from "react"

interface TooltipProps {
  tooltipText: string
  children:
    | React.ReactNode
    | ((props: { isActive: boolean }) => React.ReactNode)
}

const Tooltip = (props: TooltipProps) => {
  const { tooltipText, children } = props

  const tipRef = React.createRef<any>()

  function handleMouseEnter() {
    tipRef.current.style.opacity = 1
    tipRef.current.style.marginTop = "5px"
  }
  function handleMouseLeave() {
    tipRef.current.style.opacity = 0
    tipRef.current.style.marginTop = "0px"
  }

  return (
    <div
      className="relative flex items-center justify-center z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute whitespace-no-wrap bg-white text-black px-3 py-1 rounded-md flex items-center transition-all duration-150 z-50 border-2 shadow-ld"
        style={{ bottom: "130%", opacity: 0 }}
        ref={tipRef}
      >
        <div
          className="bg-white h-3 w-3 absolute inset-0 mx-auto border-b-2 border-r-2 shadow-lg"
          style={{ top: "75%", transform: "rotate(45deg)" }}
        />
        <span className="text-gray-700">{tooltipText}</span>
      </div>
      {children}
    </div>
  )
}

export default Tooltip
