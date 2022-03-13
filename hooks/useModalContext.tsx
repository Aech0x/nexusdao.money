import React, { useState, useContext } from "react"
import Modal, { ModalData } from "../components/Modal"
import { ExclamationIcon } from "@heroicons/react/outline"

type ModalContextData = {
  modalData: ModalData
  isModalVisible: boolean
  setModalData: React.Dispatch<React.SetStateAction<ModalData>>
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>
} | null

const ModalContext = React.createContext<ModalContextData>(null)
const ModalContextProvider: React.FC<{ children: React.ReactElement }> = ({
  children
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalData, setModalData] = useState<ModalData>({
    title: "Something Went Wrong",
    text: "If you're seeing this, something wen't wrong with the DApp. Report this to Zeus0x.",
    icon: ExclamationIcon,
    isError: true,
    buttonText: "Okay",
    buttonFunc: () => {
      setIsModalVisible(false)
    }
  })

  return (
    <ModalContext.Provider
      value={{
        modalData,
        isModalVisible,
        setModalData,
        setIsModalVisible
      }}
    >
      <Modal
        {...modalData}
        visible={isModalVisible}
        setVisible={setIsModalVisible}
      />
      {children}
    </ModalContext.Provider>
  )
}

const useModalContext = () => {
  const modalContext = useContext(ModalContext)

  if (!modalContext)
    throw new Error(
      "useModalContext can only be used inside of <ModalContextProvider/>"
    )

  return modalContext
}

export default useModalContext
export { ModalContext, ModalContextProvider }
