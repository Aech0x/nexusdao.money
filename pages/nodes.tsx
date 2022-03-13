import type { NextPage } from "next"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../store"
import { Status } from "../helpers/state"
import React, { useImperativeHandle, useRef } from "react"
import { RadioGroup } from "@headlessui/react"

import Card from "../components/Card"
import Spinner from "../components/Spinner"
import Table from "../components/Table"
import useModalContext from "../hooks/useModalContext"

import {
  ArrowCircleUpIcon,
  DownloadIcon,
  HandIcon,
  PencilIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  UploadIcon
} from "@heroicons/react/outline"

import { UserNode, Tier } from "../slices/nodes"
import Tooltip from "../components/Tooltip"
import { useState } from "react"
import { notifyError } from "../helpers/toast"

const RenameInput = React.forwardRef<{ name: string }>(function RenameInput(
  props,
  ref
) {
  const [rename, setRename] = useState("NexusVerse #0")

  useImperativeHandle(
    ref,
    () => {
      return { name: rename }
    },
    [rename]
  )

  return (
    <div className="mt-2">
      <input
        type="text"
        value={rename}
        placeholder="Token Name (length 3-32)"
        className="w-full bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
        onChange={(e) => {
          setRename(e.target.value)
        }}
      />
    </div>
  )
})

const TierRadioGroup = React.forwardRef<{ tier: number; name: string }>(
  function TierRadioGroup(props, ref) {
    const [selectedTier, setSelectedTier] = useState(0)
    const [mintName, setMintName] = useState("NexusVerse #0")

    useImperativeHandle(
      ref,
      () => {
        return { tier: selectedTier, name: mintName }
      },
      [selectedTier, mintName]
    )

    return (
      <React.Fragment>
        <div className="mt-2">
          <RadioGroup value={selectedTier} onChange={setSelectedTier}>
            <div className="flex space-x-2 justify-center">
              <RadioGroup.Option value={Tier.Gold} as={React.Fragment}>
                {({ checked }) => (
                  <button
                    className={
                      checked
                        ? "px-2 py-2 bg-blue-600 text-white rounded-lg w-1/3"
                        : "px-2 py-2 bg-gray-200 rounded-lg w-1/3"
                    }
                  >
                    Gold
                  </button>
                )}
              </RadioGroup.Option>
              <RadioGroup.Option value={Tier.Silver} as={React.Fragment}>
                {({ checked }) => (
                  <button
                    className={
                      checked
                        ? "px-2 py-2 bg-blue-600 text-white rounded-lg w-1/3"
                        : "px-2 py-2 bg-gray-200 rounded-lg w-1/3"
                    }
                  >
                    Silver
                  </button>
                )}
              </RadioGroup.Option>
              <RadioGroup.Option value={Tier.Bronze} as={React.Fragment}>
                {({ checked }) => (
                  <button
                    className={
                      checked
                        ? "px-2 py-2 bg-blue-600 text-white rounded-lg w-1/3"
                        : "px-2 py-2 bg-gray-200 rounded-lg w-1/3"
                    }
                  >
                    Bronze
                  </button>
                )}
              </RadioGroup.Option>
            </div>
          </RadioGroup>
        </div>
        <div className="mt-2">
          <input
            type="text"
            value={mintName}
            placeholder="Token Name (length 3-32)"
            className="w-full bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
            onChange={(e) => {
              setMintName(e.target.value)
            }}
          />
        </div>
      </React.Fragment>
    )
  }
)

const Nodes: NextPage = () => {
  const dispatch = useDispatch()

  const { setIsModalVisible, setModalData } = useModalContext()
  const status = useSelector((state: RootState) => state.nodes.status)
  const { tiers } = useSelector((state: RootState) => state.nodes.global)
  const { isBlacklisted, connected, isValidNetwork } = useSelector(
    (state: RootState) => state.web3
  )

  const { nodes, totalRewards, allowanceForNXS, isStakingApproved } =
    useSelector((state: RootState) => state.nodes.user)

  const mintData = useRef({
    tier: 0,
    name: "NexusVerse #0"
  })

  const renameData = useRef({
    name: "NexusVerse #0"
  })

  return (
    <>
      {status.global === Status.Success ? (
        <div className="hidden md:flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Card title="Your Nodes" value={`${nodes.length}/100`} />

            <div className="flex items-center justify-center rounded-lg py-4 px-4 bg-white drop-shadow-md">
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold text-gray-500">
                  Unclaimed Rewards
                </span>
                <span className="text-2xl font-bold">
                  {totalRewards.toFixed(3)}
                </span>
              </div>

              {connected && isValidNetwork ? (
                <button
                  className="ml-6 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  onClick={() => {
                    dispatch({ type: "nodes/claimRewards" })
                  }}
                >
                  Claim All
                </button>
              ) : null}
            </div>

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
                    if (!isStakingApproved) {
                      setModalData({
                        title: "Approve Staking Contract",
                        text: "Looks like it's your first time staking. You need to approve staking contract to transfer your NFTs. You only need to do this once. If you've already done it, just reload until this doesn't appear.",
                        icon: ShieldCheckIcon,
                        isError: false,
                        buttonText: "Approve",
                        buttonFunc: () => {
                          setIsModalVisible(false)
                          dispatch({ type: "nodes/" })
                        }
                      })
                      setIsModalVisible(true)
                      return
                    }
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
                    if (isBlacklisted) {
                      notifyError("Blacklisted address.")
                      return
                    }

                    if (!connected) {
                      notifyError("Wallet not connected.")
                      return
                    }

                    if (!isValidNetwork) {
                      notifyError("Connected to wrong network.")
                      return
                    }

                    if (allowanceForNXS === 0) {
                      setModalData({
                        title: "NFT Contract Allowance",
                        text: "Looks like it's your first time minting. You need to allow NFT contract to deduct your NXS balance. You only need to do this once. If you've already done it, just reload until this doesn't appear.",
                        icon: ShieldCheckIcon,
                        isError: false,
                        buttonText: "Proceed",
                        buttonFunc: () => {
                          setIsModalVisible(false)
                          dispatch({ type: "nodes/increaseAllowance" })
                        }
                      })
                      setIsModalVisible(true)
                      return
                    }

                    setModalData({
                      title: "Mint a NFT",
                      text: "Select a tier, choose a cool name and click mint.",
                      icon: PlusCircleIcon,
                      isError: false,
                      buttonText: "Mint",
                      children: <TierRadioGroup ref={mintData} />,
                      buttonFunc: () => {
                        setIsModalVisible(false)
                        dispatch({
                          type: "nodes/mintNFT",
                          payload: mintData.current
                        })
                      }
                    })
                    setIsModalVisible(true)
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
                            setModalData({
                              title: "Rename Token",
                              text: "Input a cool name and click rename.",
                              icon: PencilIcon,
                              isError: false,
                              buttonText: "Rename",
                              children: <RenameInput ref={renameData} />,
                              buttonFunc: () => {
                                setIsModalVisible(false)
                                dispatch({
                                  type: "nodes/renameToken",
                                  payload: {
                                    index: i,
                                    name: renameData.current.name
                                  }
                                })
                              }
                            })
                            setIsModalVisible(true)
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
                                payload: { index: i }
                              })
                            else
                              dispatch({
                                type: "nodes/stakeByTokenId",
                                payload: { index: i }
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
                              payload: { index: i }
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
      <div className="flex md:hidden flex-col flex-auto justify-center mb-24">
        <span className="text-2xl sm:text-4xl font-bold text-center">
          Not supported.
        </span>
        <span className="text-xl sm:text-2xl mt-2 text-center">
          This page is only available on wider screens.
        </span>
      </div>
    </>
  )
}

export default Nodes
