
"use client";

import { useEffect, useState } from "react";

export default function TouchTest() {
    const [count, setCount] = useState(0);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    return (
        <main className="min-h-screen bg-white p-10 text-black">
            <h1 className="text-2xl mb-5">
                iPhone React Test
            </h1>

            <p className="mb-5">
                React Status: {hydrated ? "HYDRATED" : "NOT HYDRATED"}
            </p>

            <button
                onClick={() => setCount((prev) => prev + 1)}
                className="bg-blue-600 text-white p-5 rounded-lg"
            >
                TAP ME
            </button>

            <p className="mt-5">
                Count: {count}
            </p>
        </main>
    );
}
