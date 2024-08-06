require('dotenv').config();
const Layout = ({ children }) => {

    return (
        <>

            <main className="">
                {children}
            </main>
        </>
    );
};

export default Layout;