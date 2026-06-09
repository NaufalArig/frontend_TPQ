"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import Cookies from "js-cookie";
import { getUser } from "@/services/user";
import { User } from "@/types/user";

type UserContextType = {
    user: User | null;
    loading: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    setUser: () => { },
});

export const UserProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const token = Cookies.get("token");

                if (!token) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                const data = await getUser();

                setUser(data);
            } catch (err) {
                console.log("USER ERROR:", err);
                Cookies.remove("token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);