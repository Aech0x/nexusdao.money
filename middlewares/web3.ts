import {
  abis,
  addresses,
  DEFAULT_CHAIN_ID,
  networks
} from "../constants/network"

import { AnyAction, Middleware, Dispatch } from "@reduxjs/toolkit"
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers"
import { ethers, Contract, BigNumber } from "ethers"
import { notifyError, notifyInfo } from "../helpers/toast"
import { setWeb3State } from "../slices/web3"
import { RootState } from "../store"
import {
  getGlobalPresaleData,
  getUserPresaleData,
  setMimApprovedAmount,
  incrementTotalSold,
  setIsPublicSale,
  setIsAnnounced,
  incrementInvested,
  setIsClaimable,
  decrementInvested,
  setLastClaimedAt
} from "../slices/presale"

import Web3Modal from "web3modal"
import WalletConnectProvider from "@walletconnect/web3-provider"
import { MAX_UINT256 } from "../constants/solidity"
import { getGlobalNodeData, getUserNodeData, UserNode } from "../slices/nodes"

type Requirement = {
  value: boolean
  reason: string
}

const createWeb3Middleware = (): Middleware => {
  const web3Modal =
    typeof window !== "undefined"
      ? new Web3Modal({
          cacheProvider: true,
          providerOptions: {
            walletconnect: {
              package: WalletConnectProvider,
              options: {
                rpc: {
                  DEFAULT_CHAIN_ID: networks[DEFAULT_CHAIN_ID].rpcUrls[0]
                },
                qrcode: true,
                qrcodeModalOptions: {
                  mobileLinks: ["metamask", "trust"]
                }
              }
            }
          }
        })
      : null

  let rawProvider: any = null
  let provider: JsonRpcProvider | Web3Provider = new JsonRpcProvider(
    networks[DEFAULT_CHAIN_ID].rpcUrls[0]
  )

  const contracts = {
    NEXUS_ERC20: new Contract(
      addresses.NEXUS_ERC20,
      abis.NEXUS_ERC20,
      provider
    ),
    NEXUS_ERC721: new Contract(
      addresses.NEXUS_ERC721,
      abis.NEXUS_ERC721,
      provider
    ),
    NEXUS_PRESALE: new Contract(
      addresses.NEXUS_PRESALE,
      abis.NEXUS_PRESALE,
      provider
    ),
    NEXUS_VAULT: new Contract(
      addresses.NEXUS_VAULT,
      abis.NEXUS_VAULT,
      provider
    ),
    NEXUS_RM: new Contract(addresses.NEXUS_RM, abis.NEXUS_RM, provider),
    MIM: new Contract(addresses.MIM, abis.ERC20, provider)
  }

  const execFunc = async (
    contract: Contract,
    signature: string,
    params: any[]
  ) => {
    try {
      const gasLimit = ethers.utils.formatUnits(
        await contract.estimateGas[signature](...params),
        "wei"
      )
      await contract[signature](...params, { gasLimit })
    } catch (e: any) {
      notifyError(e.message)
      console.error(e)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) web3Modal?.clearCachedProvider()
    window.location.reload()
  }

  const handleChainChanged = (hexChainId: string) => {
    window.location.reload()
  }

  const checkRequirements = (requirements: Requirement[]) => {
    for (let i = 0; i < requirements.length; i++) {
      if (!requirements[i].value) {
        notifyError(requirements[i].reason)
        return true
      }
    }

    return false
  }

  return ({ dispatch, getState }) =>
    (next: Dispatch) =>
    (action: AnyAction) => {
      const state: RootState = getState()
      const { connected, isValidNetwork, isBlacklisted } = state.web3

      const requirements: Requirement[] = [
        { value: !isBlacklisted, reason: "Blacklisted address." },
        { value: connected, reason: "Wallet not connected." },
        { value: isValidNetwork, reason: "Connected to wrong network." }
      ]

      let shouldExecute = false
      let contractToUse = contracts.NEXUS_VAULT
      let signature = "claim(uint256[])"
      let params: any[] = []

      switch (action.type) {
        case "web3/connect":
          if (!web3Modal) {
            notifyError("Web3Modal not defined.")
            break
          }

          if (connected) {
            notifyError("Already connected to DApp.")
            break
          }

          web3Modal
            .connect()
            .then((connectedProvider) => {
              rawProvider = connectedProvider
              rawProvider.on("accountsChanged", handleAccountsChanged)
              rawProvider.on("chainChanged", handleChainChanged)

              provider = new Web3Provider(connectedProvider)
              return provider.getSigner()
            })
            .then((signer) => {
              contracts.NEXUS_ERC20 = contracts.NEXUS_ERC20.connect(signer)
              contracts.MIM = contracts.MIM.connect(signer)
              contracts.NEXUS_ERC721 = contracts.NEXUS_ERC721.connect(signer)
              contracts.NEXUS_PRESALE = contracts.NEXUS_PRESALE.connect(signer)
              contracts.NEXUS_VAULT = contracts.NEXUS_VAULT.connect(signer)
              contracts.NEXUS_RM = contracts.NEXUS_RM.connect(signer)

              return Promise.all([
                signer.getAddress(),
                provider.getNetwork().then((network) => network.chainId)
              ])
            })
            .then(([address, chainId]) => {
              dispatch(
                setWeb3State({
                  connected: true,
                  address,
                  isValidNetwork: chainId === DEFAULT_CHAIN_ID,
                  isBlacklisted: false
                })
              )

              dispatch({ type: "presale/getUserPresaleData" })
              dispatch({ type: "nodes/getUserNodeData" })

              contracts.NEXUS_PRESALE.on("ClaimingEnabled()", () => {
                dispatch(setIsClaimable(true))
              })

              contracts.MIM.on(
                contracts.MIM.filters.Approval(
                  address,
                  contracts.NEXUS_PRESALE.address
                ),
                (owner: string, spender: string, value: BigNumber) => {
                  dispatch(
                    setMimApprovedAmount(
                      parseFloat(ethers.utils.formatEther(value))
                    )
                  )
                }
              )

              contracts.NEXUS_PRESALE.on(
                contracts.NEXUS_PRESALE.filters.TokensClaimed(null),
                (owner: string, tokenAmount: BigNumber) => {
                  if (owner.toLowerCase() === address.toLowerCase()) {
                    dispatch(setLastClaimedAt(Date.now() / 1000))
                    dispatch(
                      decrementInvested(
                        parseFloat(ethers.utils.formatEther(tokenAmount))
                      )
                    )
                  }
                }
              )

              contracts.NEXUS_PRESALE.on("PublicSaleStarted()", () => {
                dispatch(setIsPublicSale(true))
              })

              contracts.NEXUS_PRESALE.on(
                "ICOAnnounced(uint256,uint256)",
                (sTime: BigNumber, eTime: BigNumber) => {
                  dispatch(
                    setIsAnnounced({
                      sTime: sTime.toNumber(),
                      eTime: eTime.toNumber()
                    })
                  )
                }
              )

              contracts.NEXUS_PRESALE.on(
                "TokensBought(address,uint256,uint256)",
                (buyer: string, tokenAmount: BigNumber, withMIM: BigNumber) => {
                  dispatch(
                    incrementTotalSold(
                      parseFloat(ethers.utils.formatEther(tokenAmount))
                    )
                  )

                  if (
                    buyer.toLocaleLowerCase() === address.toLocaleLowerCase()
                  ) {
                    dispatch(
                      incrementInvested(
                        parseFloat(ethers.utils.formatEther(tokenAmount))
                      )
                    )
                  }
                }
              )
            })
            .catch((e) => {
              console.error(e)
            })
          break
        case "web3/autoConnect":
          if (web3Modal?.cachedProvider) dispatch({ type: "web3/connect" })
          break
        case "web3/disconnect":
          if (!web3Modal) {
            notifyError("Web3Modal not defined.")
            break
          }

          if (!connected) {
            notifyError("Not connected to DApp.")
            break
          }

          if (rawProvider?.removeListener) {
            rawProvider.removeListener("accountsChanged", handleAccountsChanged)
            rawProvider.removeListener("chainChanged", handleChainChanged)
          }

          web3Modal.clearCachedProvider()
          dispatch(
            setWeb3State({
              connected: false,
              isValidNetwork: true,
              isBlacklisted: false,
              address: String()
            })
          )

          break
        case "presale/claimTokens":
          {
            const {
              user: { lastClaimedAt },
              global: { canClaimOnceIn, isClaimable }
            } = state.presale

            requirements.push(
              {
                value: isClaimable,
                reason: "Claiming not enabled."
              },
              {
                value: Date.now() / 1000 > lastClaimedAt + canClaimOnceIn,
                reason: `Already claimed once in ${canClaimOnceIn / 3600} hrs.`
              }
            )

            signature = "claimTokens()"
            params = []
            contractToUse = contracts.NEXUS_PRESALE
            shouldExecute = true
          }
          break
        case "presale/buyTokens":
          {
            if (!action.payload) notifyError("Buy amount not defined.")
            const { startTime, endTime, isPublicSale } = state.presale.global
            const { isWhitelisted } = state.presale.user

            requirements.push(
              {
                value: Date.now() / 1000 > startTime,
                reason: "Sale not started yet."
              },
              {
                value: Date.now() / 1000 < endTime,
                reason: "Sale ended."
              },
              {
                value: isPublicSale || isWhitelisted,
                reason: "Not a whitelisted address."
              }
            )

            signature = "buyTokens(uint26)"
            params = [
              ethers.utils.parseEther(action.payload.toString()).toString()
            ]
            contractToUse = contracts.NEXUS_PRESALE
            shouldExecute = true
          }
          break
        case "presale/approveMim":
          {
            const {
              global: { publicSaleLimit, publicSalePrice },
              user: { mimApprovedAmount }
            } = state.presale

            const mimAmount = publicSaleLimit * publicSalePrice

            requirements.push({
              value: mimApprovedAmount < mimAmount,
              reason: "Already approved MIM."
            })

            signature = "approve(address,uint256)"
            params = [contracts.NEXUS_PRESALE.address, MAX_UINT256]
            contractToUse = contracts.MIM
            shouldExecute = true
          }
          break
        case "presale/getGlobalPresaleData":
          dispatch<any>(getGlobalPresaleData({ provider }))
          break
        case "presale/getUserPresaleData":
          {
            const { address } = state.web3
            dispatch<any>(getUserPresaleData({ provider, address }))
          }
          break
        case "nodes/claimRewards":
          {
            const { nodes, count } = state.nodes.user

            requirements.push({
              value: count.staked > 0,
              reason: "No staked tokens in wallet."
            })

            signature = "claim(uint256[])"
            params = [nodes.map((node: UserNode) => node.tokenId)]
            contractToUse = contracts.NEXUS_VAULT
            shouldExecute = true
          }
          break
        case "nodes/getUserNodeData":
          {
            const { address } = state.web3
            dispatch<any>(
              getUserNodeData({ contract: contracts.NEXUS_ERC721, address })
            )
          }
          break
        case "nodes/getGlobalNodeData":
          dispatch<any>(getGlobalNodeData({ contract: contracts.NEXUS_ERC721 }))
          break
        default:
          break
      }

      if (shouldExecute && !checkRequirements(requirements)) {
        notifyInfo("Request sent to metamask.")
        execFunc(contractToUse, signature, params)
      }

      return next(action)
    }
}

export default createWeb3Middleware
