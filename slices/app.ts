import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type AppState = {
  isSidebarOpen: boolean
}

const appSlice = createSlice({
  name: "app",
  initialState: {
    isSidebarOpen: false
  },
  reducers: {
    setSidebarState: (state: AppState, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload
    }
  }
})

export default appSlice.reducer
export const { setSidebarState } = appSlice.actions
