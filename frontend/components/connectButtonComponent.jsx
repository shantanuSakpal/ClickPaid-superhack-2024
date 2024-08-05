// app/src/components/ConnectButtonComponent.js
import { ThirdwebProvider, ConnectButton} from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { createWallet, walletConnect } from "thirdweb/wallets";
require('dotenv').config();

const client = createThirdwebClient({
  clientId: process.env.NEXT_THIRD_WEB_ID,
});

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  walletConnect(),
  createWallet("com.trustwallet.app"),
  createWallet("io.zerion.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
];

export default function ConnectButtonComponent() {
  return (

    <ConnectButton
    client={client}
    wallets={wallets}
    theme={"dark"}
    connectModal={{ size: "wide" }}
  />

  );
}
