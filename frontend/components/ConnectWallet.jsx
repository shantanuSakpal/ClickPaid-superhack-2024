import {GlobalContext} from "@/app/contexts/UserContext";
import {useContext, useEffect} from "react";
import {ConnectButton} from "thirdweb/react";
import {client} from "@/app/_lib/client";
import {useActiveAccount, useActiveWallet} from "thirdweb/react";
import {
    createWallet,
    walletConnect,
} from "thirdweb/wallets";
import React from 'react';
import {base, ethereum, sepolia, baseSepolia, optimismSepolia} from "thirdweb/chains";
import {defineChain} from "thirdweb";


function ConnectWallet({title}) {
    const {userData, setUserData, selectedChain, setSelectedChain} = useContext(GlobalContext);
    const activeAccount = useActiveAccount();
    const activeWallet = useActiveWallet();
    const wallets = [
        createWallet("io.metamask"),
        createWallet("com.coinbase.wallet"),
        walletConnect(),
    ];
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
        {
            name: 'Metal L2 Testnet',
            id: "metal-l2",
            image: '/chain/metal-L2.png',
            apiEndpoint: '/api/chain/metal-L2/createPost'
        },
    ];


    const metalL2Testnet = defineChain({
        id: 1740,
        name: "Metal L2 Testnet",
        nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18},
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
        nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18},
        blockExplorers: [
            {
                name: "Blockscout",
                url: "https://sepolia.explorer.mode.network/"
            }
        ],
        testnet: true
    });

    useEffect(() => {
        if (activeWallet) {
            console.log("Active Account", activeWallet.getChain().name);
            setSelectedChain(chains.find(chain => chain.name === activeWallet.getChain().name));
        }
    }, [activeAccount])
    return (
        <div>
            <ConnectButton
                chains={[optimismSepolia, baseSepolia, modeTestnet, metalL2Testnet]}
                wallets={wallets}
                client={client} theme="dark"
                onConnect={(wallet) => {
                    console.log("Connected to wallet", wallet.getChain());
                    //set the selected chain by matching name
                    setSelectedChain(chains.find(chain => chain.name === wallet.getChain().name));
                }}
                connectButton={
                    {label: title || "Connect Wallet"}
                }

            />

        </div>
    );
}

export default ConnectWallet;