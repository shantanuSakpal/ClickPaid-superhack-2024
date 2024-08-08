import { createThirdwebClient, defineChain } from "thirdweb";
import { useNetworkSwitcherModal } from "thirdweb/react";
import { useActiveWalletChain } from "thirdweb/react";
import { base, ethereum, sepolia, baseSepolia, optimismSepolia } from "thirdweb/chains";
import {GlobalContext} from "@/app/contexts/UserContext";
import {useContext} from "react";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
});


export default function SwitchChains() {
  const networkSwitcher = useNetworkSwitcherModal();
  const activeChain = useActiveWalletChain();
  const { selectedChain, setSelectedChain} = useContext(GlobalContext);

  const chains = [
    {
      name: 'OP Sepolia',
      id: "op-sepolia",
      image: '/chain/optimism.jpeg',
      apiEndpoint: '/api/chain/op-sepolia/createPost'
    },
    {
      name: 'Base Sepolia',
      id: "base-sepolia",
      image: '/chain/base.jpeg',
      apiEndpoint: '/api/chain/base-sepolia/createPost'
    },
    {
      name: 'Mode Testnet',
      id: "mode-testnet",
      image: '/chain/mode.png',
      apiEndpoint: '/api/chain/mode-testnet/createPost'
    },
    {name: 'Metal L2 Testnet', id: "metal-l2", image: '/chain/metal-L2.png', apiEndpoint: '/api/chain/metal-L2/createPost'},
  ];

  const metalL2Testnet = defineChain({
    id: 1740,
    name: "Metal L2 Testnet",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    blockExplorers: [
      {
        name: "Blockscout",
        url: "https://testnet.explorer.metall2.com"
      }
    ],
    testnet: true
  });

  const modeTestnet = defineChain({
    id: 919,
    name: "Mode Testnet",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    blockExplorers: [
      {
        name: "Blockscout",
        url: "https://sepolia.explorer.mode.network/"
      }
    ],
    testnet: true
  });

  function handleClick() {
    networkSwitcher.open({
      client,
      theme: "light",
      sections: [
        { label: "Currently supported", chains: [baseSepolia, optimismSepolia,modeTestnet, metalL2Testnet] },
        { label: "Test networks", chains: [baseSepolia, optimismSepolia, modeTestnet, metalL2Testnet] }

      ],
      onSwitch: (chain) => {
        console.log("Switched to chain", chain);
        const selectedChainConfig = chains.find((c) => c.name === chain.name);
        if (selectedChainConfig) {
          setSelectedChain(selectedChainConfig);
        }
      }
    });
  }

  // console.log("activeChain", activeChain);

  return <div className="hover:cursor-pointer bg-black hover:bg-theme-gray-dark text-white font-bold rounded-lg px-3 py-2" onClick={handleClick}> Switch Network </div>;
}