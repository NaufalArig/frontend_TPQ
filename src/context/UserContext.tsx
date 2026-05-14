"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import Cookies from "js-cookie";
import { getUser } from "@/services/user";

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
};

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

                console.log("COOKIE TOKEN:", token);

                if (!token) {
                    setLoading(false);
                    return;
                }

                const data = await getUser();

                console.log("USER DATA:", data);

                setUser(data);
            } catch (err) {
                console.log("USER ERROR:", err);
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