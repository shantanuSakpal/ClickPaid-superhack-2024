import React from 'react';
import {Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/react";
import {ChevronDownIcon} from "@heroicons/react/20/solid";
import {GlobalContext} from "@/app/contexts/UserContext";
import {useContext} from "react";

function ChainSelect() {
    const {userData, setUserData, selectedChain, setSelectedChain} = useContext(GlobalContext);
    // console.log("userData", userData)
    console.log("selectedChain", selectedChain)
    //chains
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
            name: 'Mode TestNet',
            id: "mode-testnet",
            image: '/chain/mode.png',
            apiEndpoint: '/api/chain/mode-testnet/createPost'
        },
        {name: 'Metal L2', id: "metal-l2", image: '/chain/metal-L2.png', apiEndpoint: '/api/chain/metal-L2/createPost'},
    ];


    return (
        <div className="w-full">
            {
                selectedChain && (
                    <Menu as="div" className="relative inline-block text-left w-full">
                        <div>
                            <MenuButton
                                className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                <img src={selectedChain.image} alt={selectedChain.name}
                                     className="w-5 h-5 rounded-full mr-2"/>
                                {selectedChain.name}
                                <ChevronDownIcon aria-hidden="true"
                                                 className="-mr-1 h-5 w-5 text-gray-400"/>
                            </MenuButton>
                        </div>
                        <MenuItems
                            transition
                            className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                            <div className="py-1">
                                {chains.map((chain) => (
                                    <MenuItem key={chain.name}>
                                        {({active}) => (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedChain(chain)}
                                                className={`whitespace-nowrap block w-full px-4 py-2 text-left text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                                            >
                                                <img src={chain.image} alt={chain.name}
                                                     className="w-5 h-5 rounded-full mr-2 inline"/>
                                                {chain.name}
                                            </button>
                                        )}
                                    </MenuItem>
                                ))}
                            </div>
                        </MenuItems>
                    </Menu>
                )
            }
        </div>
    );
}

export default ChainSelect;