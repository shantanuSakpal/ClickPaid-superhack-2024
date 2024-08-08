import { useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { sepolia } from "thirdweb/chains";

const contract = getContract({
    address: "0x...",
    chain: sepolia,
    client,
});

const { mutate: sendTx, data: transactionResult } = useSendTransaction();

const onClick = () => {
    const transaction = prepareContractCall({
            contract,
            method: "function transfer(address to, uint256 value)",
            params: [to, value],
        }),
        });
sendTx(transaction);
};