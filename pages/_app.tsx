import "../styles/globals.css"
import type { AppProps } from "next/app"
import { Provider } from "react-redux"

import store from "../store"
import Head from "next/head"
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"

import { ToastContainer } from "react-toastify"
import { ModalContextProvider } from "../hooks/useModalContext"
import "react-toastify/dist/ReactToastify.min.css"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>Nexus DAO</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="The best hybrid NaaS + DaaS protocol on Avalanche with reflections and NFTs."
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </Head>

      <Provider store={store}>
        <ModalContextProvider>
          <div className="flex">
            <Sidebar />
            <div className="flex flex-auto bg-gray-100">
              <div className="w-full mx-auto max-w-4xl px-8">
                <div className="flex flex-col min-h-screen">
                  <Topbar />
                  <Component {...pageProps} />
                </div>
              </div>
            </div>
          </div>
        </ModalContextProvider>
      </Provider>
      <ToastContainer />
    </>
  )
}

export default MyApp
