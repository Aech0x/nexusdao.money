import ERC20ABI from "../abis/ERC20.json"
import NexusERC20ABI from "../abis/NexusERC20.json"
import NexusERC721ABI from "../abis/NexusERC721.json"
import NexusPresaleABI from "../abis/NexusPresale.json"
import NexusVaultABI from "../abis/NexusVault.json"
import ReflectionManagerABI from "../abis/ReflectionManager.json"
import { idToHexString } from "../helpers/metamask"

enum ChainID {
  AVALANCHE = 43114,
  HARDHAT = 31337
}

const networks = {
  [ChainID.AVALANCHE]: {
    chainId: idToHexString(ChainID.AVALANCHE),
    chainName: "Avalanche Mainnet C-Chain",
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://snowtrace.io/"],
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18
    }
  },

  [ChainID.HARDHAT]: {
    chainId: idToHexString(ChainID.HARDHAT),
    chainName: "Hardhat Local Testnet",
    rpcUrls: ["http://127.0.0.1:8545"],
    blockExplorerUrls: [],
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18
    }
  }
}

const abis = {
  NEXUS_ERC20: NexusERC20ABI,
  NEXUS_ERC721: NexusERC721ABI,
  NEXUS_PRESALE: NexusPresaleABI,
  NEXUS_VAULT: NexusVaultABI,
  NEXUS_RM: ReflectionManagerABI,
  ERC20: ERC20ABI
}

const DEFAULT_CHAIN_ID = process.env.USE_LOCAL_TESTNET
  ? ChainID.HARDHAT
  : ChainID.AVALANCHE

const addresses = {
  NEXUS_ERC20: "0x3F988d27647Ef530ce448E96DD1783D38cE5Bf90",
  NEXUS_ERC721: "0x9C1AA8E81Cab7910302982050fCA6ce5eDc04765",
  NEXUS_PRESALE: "0x66271157a7552c95fEAc2B64321D6b4fd0B75685",
  NEXUS_VAULT: "0x0B91a5fE8994150D66a3BaEFFF156AcAF5f71777",
  NEXUS_RM: "0x2cA73D27b7aEe086A7dC2872C5d3145Dbe6e72eE",
  MIM: "0x130966628846BFd36ff31a822705796e8cb8C18D"
}

export { ChainID, networks, addresses, abis, DEFAULT_CHAIN_ID }
