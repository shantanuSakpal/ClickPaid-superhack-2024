import React from "react";
import { Button, ButtonGroup } from "@nextui-org/react";

const chains = [
  { name: 'OP Sepolia', image: '/chain/optimism.jpeg', balance: '$1,200.00' },
  { name: 'Base Sepolia', image: '/chain/base.jpeg', balance: '$800.00' },
  { name: 'Mode TestNet', image: '/chain/mode.png', balance: '$600.00' },
  { name: 'Metal L2', image: '/chain/metal-L2.png', balance: '$1,000.00' },
  { name: 'World Coin', image: '/chain/worldcoin.png', balance: '$1,400.00' },
];

export default function Balances() {
  return (
    <div className="p-4 ml-[30vh]">
      {chains.map((chain, index) => (
        <div key={index} className="flex items-center justify-between p-4 mb-2 w-[80%] h-[15vh] border border-gray-250 rounded-xl ">
          <div className="flex items-center space-x-4">
            <img src={chain.image} alt={chain.name} className="w-12 h-12 rounded-full" />
            <p className="font-semibold">{chain.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <p className="font-medium">{chain.balance}</p>
            <ButtonGroup >

              <Button color="default" className="rounded-xl" >Withdraw</Button>
            </ButtonGroup>
          </div>
        </div>
      ))}
    </div>
  );
}
