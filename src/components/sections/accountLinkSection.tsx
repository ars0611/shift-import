import { useState, useEffect } from "react";
import { SignInButton } from "../elements/signInButton";
import { requestAuthCheck, requestAuthConnect } from "@/lib/clients/authClient";

type AuthState = "checking" | "connected" | "disconnected";

export function AccountLinkSection() {
    const [authState, setAuthState] = useState<AuthState>("checking");
    const [authError, setAuthError] = useState<string>('');

    // 初回マウント時に認証済みかチェック
    useEffect(() => {
        (async () => {
            setAuthError('');
            setAuthState("checking");
            try {
                const res = await requestAuthCheck();
                setAuthState(res.ok && res.connected ? "connected" : "disconnected")
                setAuthError(res.error ? res.error : '');
            } catch (e) {
                setAuthState("disconnected");
                setAuthError(e instanceof Error ? e.message : String(e));
            }
        })();
    }, []);

    /**
     * Google認証をbackground.tsで実行する
     * @return Promise<void>
     */
    async function onConnect(): Promise<void> {
        setAuthError('');
        try {
            const res = await requestAuthConnect();
            setAuthState(res.ok && res.connected ? "connected" : "disconnected");
            setAuthError(res.error ? res.error : '');
        } catch (e) {
            setAuthState("disconnected");
            setAuthError(e instanceof Error ? e.message : String(e));
        }
    }
    return (
        <>
            {authState === "checking" && <p>確認中...</p>}
            {authState === "connected" && <p>連携済み</p>}
            {
                authState === "disconnected" && (
                    <>
                        <p>未連携</p>
                        {authError && <p>{authError}</p>}
                        <SignInButton onClickFunc={onConnect} />
                    </>
                )
            }
        </>
    )
}
