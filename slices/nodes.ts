import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { ethers } from "ethers"
import { addresses } from "../constants/network"
import { setAll, Status } from "../helpers/state"

enum Tier {
  Gold,
  Silver,
  Bronze
}

type TierInfo = {
  name: string
  price: number
  count: number
  dailyReward: string
}

type UserNode = {
  name: string
  tier: Tier
  tokenId: number
  isStaked: boolean
  rewards: number
}

const getGlobalNodeData = createAsyncThunk(
  "nodes/getGlobalNodeData",
  async ({ contract }: { contract: ethers.Contract }) => {
    const goldTierInfo = await contract.tiers(Tier.Gold)
    const silverTierInfo = await contract.tiers(Tier.Silver)
    const bronzeTierInfo = await contract.tiers(Tier.Bronze)

    const tiers: TierInfo[] = []

    ;[goldTierInfo, silverTierInfo, bronzeTierInfo].forEach((tierInfo, i) => {
      tiers.push({
        name: i == Tier.Gold ? "Gold" : i == Tier.Silver ? "Silver" : "Bronze",
        price: parseFloat(ethers.utils.formatEther(tierInfo.price)),
        count: tierInfo.count.toNumber(),
        dailyReward: (
          (tierInfo.emissionRate.toNumber() / 10 ** 18) *
          86400
        ).toFixed(3)
      })
    })

    return {
      tiers
    }
  }
)

const getUserNodeData = createAsyncThunk(
  "nodes/getUserNodeData",
  async ({
    contract,
    address
  }: {
    contract: ethers.Contract
    address: string
  }) => {
    let totalRewards = 0
    const nodes: UserNode[] = []
    const detailedBalance = await contract.getDetailedBalance(address)

    const count = {
      staked: 0,
      unstaked: 0
    }

    detailedBalance.forEach((node: any) => {
      const rewards = parseFloat(ethers.utils.formatEther(node.rewards))
      totalRewards += rewards

      if (node.isStaked) count.staked++
      else count.unstaked++

      nodes.push({
        name: node.name,
        tier: node.tier.toNumber(),
        tokenId: node.id.toNumber(),
        isStaked: node.isStaked,
        rewards
      })
    })

    const isStakingApproved = await contract.isApprovedForAll(
      address,
      addresses.NEXUS_VAULT
    )

    return {
      nodes,
      count,
      isStakingApproved,
      totalRewards
    }
  }
)

const nodesSlice = createSlice({
  name: "nodes",
  initialState: {
    status: {
      global: Status.Initialized,
      user: Status.Initialized
    },
    global: {
      tiers: [
        { name: "Gold", price: 60, count: 0, dailyReward: 0.556 },
        { name: "Silver", price: 30, count: 0, dailyReward: 0.278 },
        { name: "Bronze", price: 10, count: 0, dailyReward: 0.093 }
      ]
    },
    user: {
      nodes: [],
      count: {
        staked: 0,
        unstaked: 0
      },
      isStakingApproved: false,
      totalRewards: 0
    }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getGlobalNodeData.pending, (state) => {
        state.status.global = Status.Fetching
      })
      .addCase(getGlobalNodeData.fulfilled, (state, action) => {
        setAll(state.global, action.payload)
        state.status.global = Status.Success
      })
      .addCase(getGlobalNodeData.rejected, (state, { error }) => {
        state.status.global = Status.Error
        console.error(error)
      })
      .addCase(getUserNodeData.pending, (state) => {
        state.status.user = Status.Fetching
      })
      .addCase(getUserNodeData.fulfilled, (state, action) => {
        setAll(state.user, action.payload)
        state.status.user = Status.Success
      })
  }
})

export default nodesSlice.reducer
export { getGlobalNodeData, getUserNodeData, type UserNode, Tier }
