import React from 'react';
import {Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/react";
import {ChevronDownIcon} from "@heroicons/react/20/solid";
import {GlobalContext} from "@/app/contexts/UserContext";
import {useContext} from "react";
import {ConnectButton} from "thirdweb/react";
import SwitchChains from "@components/SwitchChains";
import {client} from "@/app/_lib/client";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";

function ChainSelect() {

    return (
        <div className="w-full">
            <ConnectButton client={client} theme="light"/>
        </div>
    );
}

export default ChainSelect;