import type { NextPage } from "next"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../store"
import { Status } from "../helpers/state"

import Card from "../components/Card"
import Spinner from "../components/Spinner"
import Table from "../components/Table"

import {
  ArrowCircleUpIcon,
  DownloadIcon,
  HandIcon,
  PencilIcon,
  PlusCircleIcon,
  UploadIcon
} from "@heroicons/react/outline"

import { UserNode, Tier } from "../slices/nodes"
import Tooltip from "../components/Tooltip"

const Nodes: NextPage = () => {
  const dispatch = useDispatch()
  const status = useSelector((state: RootState) => state.nodes.status)
  const { tiers } = useSelector((state: RootState) => state.nodes.global)
  const { connected, isValidNetwork } = useSelector(
    (state: RootState) => state.web3
  )

  const { nodes, totalRewards } = useSelector(
    (state: RootState) => state.nodes.user
  )

  return (
    <>
      {status.global === Status.Success && status.user === Status.Success ? (
        <div className="flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Card title="Your Nodes" value={`${nodes.length}/100`} />

            {connected && isValidNetwork ? (
              <div className="flex items-center justify-center rounded-lg py-4 px-4 bg-white drop-shadow-md">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-semibold text-gray-500">
                    Unclaimed Rewards
                  </span>
                  <span className="text-2xl font-bold">
                    {totalRewards.toFixed(3)}
                  </span>
                </div>

                <button
                  className="ml-6 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  onClick={() => {
                    dispatch({ type: "nodes/claimRewards" })
                  }}
                >
                  Claim All
                </button>
              </div>
            ) : null}

            <Table
              columns={[
                { Header: "Tier", accessor: "name" },
                { Header: "Cost (NXS)", accessor: "price" },
                { Header: "Daily Reward (NXS)", accessor: "dailyReward" }
              ]}
              data={tiers}
            />

            <div className="flex flex-col justify-center rounded-lg py-3 bg-white drop-shadow-md text-center px-4">
              <span className="text-lg font-semibold text-gray-500 mb-2">
                Global Actions
              </span>
              <div className="flex justify-center gap-x-4">
                <button
                  className="bg-gray-200 hover:bg-blue-600 hover:text-white px-2 py-2 rounded-lg"
                  onClick={() => {
                    dispatch({ type: "nodes/stakeAll" })
                  }}
                >
                  <DownloadIcon className="h-10 w-10" />
                </button>

                <button
                  type="button"
                  data-tooltip-target="unstake-tooltip"
                  className="bg-gray-200 hover:bg-blue-600 hover:text-white px-2 py-2 rounded-lg"
                  onClick={() => {
                    dispatch({ type: "nodes/unstakeAll" })
                  }}
                >
                  <UploadIcon className="h-10 w-10" />
                </button>

                <button
                  className="bg-gray-200 hover:bg-blue-600 hover:text-white px-2 py-2 rounded-lg"
                  onClick={() => {
                    dispatch({ type: "nodes/mintNFT" })
                  }}
                >
                  <PlusCircleIcon className="h-10 w-10" />
                </button>
              </div>
              <span className="text-gray-500 mt-2">
                Stake All / Unstake All / Mint NFT
              </span>
            </div>
          </div>

          <div className="my-5">
            <Table
              columns={[
                { Header: "Token ID", accessor: "tokenId" },
                { Header: "Name", accessor: "name" },
                { Header: "Tier", accessor: "tier" },
                { Header: "Status", accessor: "status" },
                { Header: "Rewards", accessor: "rewards" },
                { Header: "Actions", accessor: "actions" }
              ]}
              data={nodes.map((node: UserNode, i) => {
                return {
                  name: node.name,
                  tokenId: `#${node.tokenId}`,
                  tier:
                    node.tier === Tier.Gold
                      ? "Gold"
                      : node.tier === Tier.Silver
                      ? "Silver"
                      : "Bronze",
                  status: (
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        node.isStaked
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {node.isStaked ? "Staked" : "Unstaked"}
                    </span>
                  ),
                  rewards: `${node.rewards.toFixed(3)} NXS`,
                  actions: (
                    <div className="flex items-center justify-center gap-x-2">
                      <Tooltip tooltipText="edit name">
                        <button
                          className="py-1 px-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                          onClick={() => {
                            dispatch({ type: "nodes/renameToken", payload: i })
                          }}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      </Tooltip>

                      <Tooltip tooltipText="upgrade tier">
                        <button
                          className="py-1 px-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                          onClick={() => {
                            dispatch({
                              type: "nodes/upgradeToken",
                              payload: i
                            })
                          }}
                        >
                          <ArrowCircleUpIcon className="h-5 w-5" />
                        </button>
                      </Tooltip>

                      <Tooltip
                        tooltipText={node.isStaked ? "unstake" : "stake"}
                      >
                        <button
                          className="py-1 px-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                          onClick={() => {
                            if (node.isStaked)
                              dispatch({
                                type: "nodes/unstakeByTokenId",
                                payload: i
                              })
                            else
                              dispatch({
                                type: "nodes/stakeByTokenId",
                                payload: i
                              })
                          }}
                        >
                          {node.isStaked ? (
                            <UploadIcon className="h-5 w-5" />
                          ) : (
                            <DownloadIcon className="h-5 w-5" />
                          )}
                        </button>
                      </Tooltip>

                      <Tooltip tooltipText="claim">
                        <button
                          className="py-1 px-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                          onClick={() => {
                            dispatch({
                              type: "nodes/claimByTokenId",
                              payload: i
                            })
                          }}
                        >
                          <HandIcon className="h-5 w-5" />
                        </button>
                      </Tooltip>
                    </div>
                  )
                }
              })}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-auto items-center justify-center mb-24">
          <Spinner />
        </div>
      )}
    </>
  )
}

export default Nodes
