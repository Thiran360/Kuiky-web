// src/pages/OrderHistoryPage.jsx  (wrapper section only)
import { useUser } from "../../context/UserContext";

const OrderHistoryWrapper = () => {
    const { user } = useUser();
    const userId = user?.id;

    return (
        <OrderProvider userId={userId}>
            <OrderHistoryPage />
        </OrderProvider>
    );
};

export default OrderHistoryWrapper;
