import { configureStore } from "@reduxjs/toolkit"

import createWeb3Middleware from "../middlewares/web3"
import appReducer from "../slices/app"
import web3Reducer from "../slices/web3"
import presaleReducer from "../slices/presale"
import nodesReducer from "../slices/nodes"

const store = configureStore({
  reducer: {
    app: appReducer,
    web3: web3Reducer,
    presale: presaleReducer,
    nodes: nodesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(createWeb3Middleware())
})

type RootState = ReturnType<typeof store.getState>

export default store
export { type RootState }
