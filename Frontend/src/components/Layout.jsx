import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatbotWidget from './ChatbotWidget';

const Layout = ({ children }) => {
    const location = useLocation();
    const isAIPlannerPage = location.pathname === '/ai-planner';

    return (
        <>
            <Navbar />
            <main>{children}</main>
            {!isAIPlannerPage && (
                <>
                    <ChatbotWidget />
                    <Footer />
                </>
            )}
        </>
    );
};

export default Layout;