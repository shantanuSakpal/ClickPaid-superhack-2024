import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import NavbarCustom from "@/components/NavbarCustom";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ClickPaid",
  description: "Vote for thumbnails, get paid !",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" >
      <body>
      <NavbarCustom/>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
