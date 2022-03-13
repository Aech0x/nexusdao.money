import React, { useRef } from "react"
import { Dialog, Transition } from "@headlessui/react"

interface ModalData {
  title: string
  text: string
  isError: boolean
  icon: (props: React.ComponentProps<"svg">) => JSX.Element
  buttonText: string
  buttonFunc: any
  children?: React.ReactElement
}

interface ModalProps extends ModalData {
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const Modal: React.FC<ModalProps> = (props: ModalProps) => {
  const cancelButtonRef = useRef(null)

  return (
    <Transition.Root show={props.visible} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={props.setVisible}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div
                    className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                      props.isError ? "bg-red-100" : "bg-blue-100"
                    } sm:mx-0 sm:h-10 sm:w-10`}
                  >
                    <props.icon
                      className={`h-6 w-6 ${
                        props.isError ? "text-red-600" : "text-blue-600"
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg leading-6 font-medium text-gray-900"
                    >
                      {props.title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{props.text}</p>
                    </div>
                    {props.children}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${
                    props.isError
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={props.buttonFunc}
                >
                  {props.buttonText}
                </button>
                {!props.isError ? (
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => props.setVisible(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default Modal
export { type ModalData, type ModalProps }
