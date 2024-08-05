import { ThirdwebProvider } from "thirdweb/react";
require('dotenv').config(); 
const Layout = ({ children }) => {

    return (
        <>
        <ThirdwebProvider
            clientId={process.env.NEXT_THIRD_WEB_ID}
            secretKey={process.env.NEXT_THIRD_WEB_SECRET}
        >
            <main className="">
                {children}
            </main>
        </ThirdwebProvider>
        </>
    );
};

export default Layout;