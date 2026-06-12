"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from "react";

import Cookies from "js-cookie";
import { getUser } from "@/services/user";
import { User } from "@/types/user";

type UserContextType = {
    user: User | null;
    loading: boolean;
    setUser: Dispatch<SetStateAction<User | null>>;
};

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    setUser: () => {},
});

export const UserProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            try {
                const token = Cookies.get("token");

                if (!token) {
                    if (isMounted) {
                        setUser(null);
                        setLoading(false);
                    }

                    return;
                }

                const data = await getUser();

                if (isMounted) {
                    setUser(data);
                }
            } catch (err) {
                console.log("USER ERROR:", err);

                Cookies.remove("token");

                if (isMounted) {
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        init();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);