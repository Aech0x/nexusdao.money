import { DEFAULT_CHAIN_ID, networks } from "../constants/network"

const idToHexString = (id: number): string => "0x" + id.toString(16)
const idFromHexString = (str: string): number => parseInt(str, 16)

const switchRequest = () => {
  return window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: idToHexString(DEFAULT_CHAIN_ID) }]
  })
}

const addChainRequest = () => {
  return window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [networks[DEFAULT_CHAIN_ID]]
  })
}

const switchNetwork = async () => {
  if (window.ethereum) {
    try {
      await switchRequest()
    } catch (e: any) {
      if (e.code === 4902) {
        try {
          await addChainRequest()
          await switchRequest()
        } catch (e) {
          console.error(e)
        }
      }

      console.error(e)
    }
  }
}

const addToken = async (
  address: string,
  symbol: string,
  decimals: number,
  image: string
) => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address,
            symbol,
            decimals,
            image
          }
        }
      })
    } catch (e) {
      console.error(e)
    }
  }
}

export { idToHexString, idFromHexString, switchNetwork, addToken }
