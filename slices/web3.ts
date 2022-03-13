import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { setAll } from "../helpers/state"

type Web3State = {
  connected: boolean
  address: string
  isValidNetwork: boolean
  isBlacklisted: boolean
}

const web3Slice = createSlice({
  name: "web3",
  initialState: {
    connected: false,
    address: String(),
    isValidNetwork: true,
    isBlacklisted: false
  },
  reducers: {
    setWeb3State: (state: Web3State, action: PayloadAction<Web3State>) => {
      setAll(state, action.payload)
    },
    setIsBlacklisted: (state: Web3State, action: PayloadAction<boolean>) => {
      state.isBlacklisted = action.payload
    }
  }
})

export default web3Slice.reducer
export const { setWeb3State } = web3Slice.actions
