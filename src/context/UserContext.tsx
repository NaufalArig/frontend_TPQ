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
    authUnavailable: boolean;
    setUser: Dispatch<SetStateAction<User | null>>;
};

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    authUnavailable: false,
    setUser: () => {},
});

export const UserProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [authUnavailable, setAuthUnavailable] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            try {
                const token = Cookies.get("token");

                if (!token) {
                    if (isMounted) {
                        setUser(null);
                        setAuthUnavailable(false);
                        setLoading(false);
                    }

                    return;
                }

                const data = await getUser();

                if (isMounted) {
                    setUser(data);
                    setAuthUnavailable(false);
                }
            } catch (err) {
                console.log("USER ERROR:", err);

                const status =
                    err instanceof Error && "status" in err
                        ? Number((err as Error & { status?: number }).status)
                        : null;

                if (status === 401 || status === 403) {
                    Cookies.remove("token", { path: "/" });

                    if (isMounted) {
                        setUser(null);
                        setAuthUnavailable(false);
                    }

                    return;
                }

                if (isMounted) {
                    setAuthUnavailable(true);
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
        <UserContext.Provider value={{ user, loading, authUnavailable, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
