import { Status, setAll } from "../helpers/state"
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers"
import { addresses, abis } from "../constants/network"
import { ethers } from "ethers"

type GlobalPresaleData = {
  maxSold: number
  privateSalePrice: number
  privateSaleLimit: number
  publicSalePrice: number
  publicSaleLimit: number
  isAnnounced: boolean
  startTime: number
  endTime: number
  isPublicSale: boolean
  isClaimable: boolean
  canClaimOnceIn: number
  claimablePerDay: number
  totalSold: number
  totalOwed: number
}

type PresaleUserData = {
  invested: number
  lastClaimedAt: number
  isWhitelisted: boolean
  mimApprovedAmount: number
}

type PresaleState = {
  status: {
    global: Status
    user: Status
  }
  global: GlobalPresaleData
  user: PresaleUserData
}

const getGlobalPresaleData = createAsyncThunk(
  "presale/getGlobalPresaleData",
  async ({
    provider
  }: {
    provider: JsonRpcProvider | Web3Provider
  }): Promise<GlobalPresaleData> => {
    const presaleContract = new ethers.Contract(
      addresses.NEXUS_PRESALE,
      abis.NEXUS_PRESALE,
      provider
    )

    const maxSold: number = parseFloat(
      ethers.utils.formatEther(await presaleContract.MAX_SOLD())
    )

    const privateSalePrice: number = (
      await presaleContract.PRIVATE_SALE_PRICE()
    ).toNumber()

    const privateSaleLimit: number = parseFloat(
      ethers.utils.formatEther(await presaleContract.PRIVATE_SALE_LIMIT())
    )

    const publicSalePrice: number = (
      await presaleContract.PUBLIC_SALE_PRICE()
    ).toNumber()

    const publicSaleLimit: number = parseFloat(
      ethers.utils.formatEther(await presaleContract.PUBLIC_SALE_LIMIT())
    )

    const isAnnounced = await presaleContract.isAnnounced()
    const startTime = (await presaleContract.startTime()).toNumber()
    const endTime = (await presaleContract.endTime()).toNumber()

    const isPublicSale = await presaleContract.isPublicSale()
    const isClaimable = await presaleContract.isClaimable()

    const canClaimOnceIn = (await presaleContract.canClaimOnceIn()).toNumber()

    const claimablePerDay = parseFloat(
      ethers.utils.formatEther(await presaleContract.claimablePerDay())
    )

    const totalSold = parseFloat(
      ethers.utils.formatEther(await presaleContract.totalSold())
    )

    const totalOwed = parseFloat(
      ethers.utils.formatEther(await presaleContract.totalOwed())
    )

    return {
      maxSold,
      privateSalePrice,
      privateSaleLimit,
      publicSalePrice,
      publicSaleLimit,
      isAnnounced,
      startTime,
      endTime,
      isPublicSale,
      isClaimable,
      canClaimOnceIn,
      claimablePerDay,
      totalSold,
      totalOwed
    }
  }
)

const getUserPresaleData = createAsyncThunk(
  "presale/getUserPresaleData",
  async ({
    provider,
    address
  }: {
    provider: JsonRpcProvider | Web3Provider
    address: string
  }): Promise<PresaleUserData> => {
    const mimContract = new ethers.Contract(addresses.MIM, abis.ERC20, provider)
    const presaleContract = new ethers.Contract(
      addresses.NEXUS_PRESALE,
      abis.NEXUS_PRESALE,
      provider
    )

    const invested = parseFloat(
      ethers.utils.formatEther(await presaleContract.invested(address))
    )

    const lastClaimedAt = (
      await presaleContract.lastClaimedAt(address)
    ).toNumber()

    const isWhitelisted = await presaleContract.isWhitelisted(address)

    const mimApprovedAmount = parseFloat(
      ethers.utils.formatEther(
        await mimContract.allowance(address, presaleContract.address)
      )
    )

    return {
      invested,
      lastClaimedAt,
      isWhitelisted,
      mimApprovedAmount
    }
  }
)

const presaleSlice = createSlice({
  name: "presale",
  initialState: {
    status: {
      global: Status.Initialized,
      user: Status.Initialized
    },
    global: {
      maxSold: 100000,
      privateSalePrice: 1,
      privateSaleLimit: 500,
      publicSalePrice: 2,
      publicSaleLimit: 1000,
      isAnnounced: false,
      startTime: 0,
      endTime: 0,
      isPublicSale: false,
      isClaimable: false,
      canClaimOnceIn: 86400,
      claimablePerDay: 50,
      totalSold: 0,
      totalOwed: 0
    },
    user: {
      invested: 0,
      lastClaimedAt: 0,
      isWhitelisted: false,
      mimApprovedAmount: 0
    }
  },
  reducers: {
    setLastClaimedAt: (state: PresaleState, action: PayloadAction<number>) => {
      state.user.lastClaimedAt = action.payload
    },
    setIsClaimable: (state: PresaleState, action: PayloadAction<boolean>) => {
      state.global.isClaimable = action.payload
    },
    decrementInvested: (state: PresaleState, action: PayloadAction<number>) => {
      state.user.invested -= action.payload
    },
    incrementInvested: (state: PresaleState, action: PayloadAction<number>) => {
      state.user.invested += action.payload
    },
    setIsPublicSale: (state: PresaleState, action: PayloadAction<boolean>) => {
      state.global.isPublicSale = action.payload
    },
    setIsAnnounced: (
      state: PresaleState,
      action: PayloadAction<{ sTime: number; eTime: number }>
    ) => {
      state.global.startTime = action.payload.sTime
      state.global.endTime = action.payload.eTime
      state.global.isAnnounced = true
    },
    incrementTotalSold: (
      state: PresaleState,
      action: PayloadAction<number>
    ) => {
      state.global.totalSold += action.payload
    },
    setMimApprovedAmount: (
      state: PresaleState,
      action: PayloadAction<number>
    ) => {
      state.user.mimApprovedAmount = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGlobalPresaleData.pending, (state) => {
        state.status.global = Status.Fetching
      })
      .addCase(getGlobalPresaleData.fulfilled, (state, action) => {
        setAll(state.global, action.payload)
        state.status.global = Status.Success
      })
      .addCase(getGlobalPresaleData.rejected, (state, { error }) => {
        state.status.global = Status.Error
        console.error(error)
      })
      .addCase(getUserPresaleData.pending, (state) => {
        state.status.user = Status.Fetching
      })
      .addCase(getUserPresaleData.fulfilled, (state, action) => {
        setAll(state.user, action.payload)
        state.status.user = Status.Success
      })
      .addCase(getUserPresaleData.rejected, (state, { error }) => {
        state.status.user = Status.Error
        console.error(error)
      })
  }
})

export default presaleSlice.reducer
export const {
  setMimApprovedAmount,
  incrementTotalSold,
  setIsAnnounced,
  setIsPublicSale,
  decrementInvested,
  incrementInvested,
  setIsClaimable,
  setLastClaimedAt
} = presaleSlice.actions
export { getGlobalPresaleData, getUserPresaleData }
