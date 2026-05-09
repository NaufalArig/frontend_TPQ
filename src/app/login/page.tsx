"use client";

import { useState } from "react";
import { login } from "@/services/auth";
import Cookies from "js-cookie";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (
        e: React.SyntheticEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setLoading(true);

        try {
            const res = await login(email, password);

            localStorage.clear();

            Cookies.remove("token");

            Cookies.set("token", res.token, {
                expires: 1,
                sameSite: "lax",
            });

            window.location.replace("/dashboard");
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Terjadi error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
            >
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Login TPQ
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-4 p-3 border rounded-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-4 p-3 border rounded-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
                >
                    {loading ? "Loading..." : "Login"}
                </button>
            </form>
        </div>
    );
}