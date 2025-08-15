import Navbar from './Navbar';
import Footer from './Footer';
import ChatbotWidget from './ChatbotWidget';

const Layout = ({ children }) => {
    return (
        <>
            <Navbar />
            <main>{children}</main>
            <ChatbotWidget />
            <Footer /> {/* Make sure this line is not commented out */}
        </>
    );
};

export default Layout;