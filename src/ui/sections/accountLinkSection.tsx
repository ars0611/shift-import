import { useState, useEffect } from "react";
import { SignInButton } from "@/ui/components/SignInButton";
import { requestAuthCheck, requestAuthConnect } from "@/API/clients/authClient";
import { LoadingInline } from "../components/LoadingInline";

type AuthState = "checking" | "connected" | "disconnected";

export function AccountLinkSection() {
    const [authState, setAuthState] = useState<AuthState>("checking");
    const [authError, setAuthError] = useState<string>('');

    // 初回マウント時に認証済みかチェック
    useEffect(() => {
        (async () => {
            setAuthError('');
            setAuthState("checking");
            const res = await requestAuthCheck();
            setAuthState(res.ok && res.connected ? "connected" : "disconnected");
            setAuthError(res.error ? res.error : '');
        })();
    }, []);

    /**
     * Google認証をbackground.tsで実行する
     * @return Promise<void>
     */
    async function onConnect(): Promise<void> {
        setAuthError('');
        const res = await requestAuthConnect();
        setAuthState(res.ok && res.connected ? "connected" : "disconnected");
        setAuthError(res.error ? res.error : '');
    }
    return (
        <section className="space-y-2">
            {authState === "checking" && (
                <div className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                    <p className="flex items-center gap-2 font-medium">
                        <span className="h-2 w-2 rounded-full bg-yellow-500" />
                        <LoadingInline text="確認中..." />
                    </p>
                    {authError && (
                        <p className="mt-1 text-xs leading-5 text-red-700">
                            {authError}
                        </p>
                    )}
                </div>
            )}

            {authState === "connected" && (
                <div className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
                    <p className="flex items-center gap-2 font-medium">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        連携済み
                    </p>
                    {authError && (
                        <p className="mt-1 text-xs leading-5 text-red-700">
                            {authError}
                        </p>
                    )}
                </div>
            )}

            {authState === "disconnected" && (
                <>
                    <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
                        <p className="flex items-center gap-2 font-medium">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            未連携
                        </p>
                        {authError && (
                            <p className="mt-1 text-xs leading-5 text-red-700">
                                {authError}
                            </p>
                        )}
                    </div>
                    <div className="mt-2 flex justify-center">
                        <SignInButton onClickFunc={onConnect} />
                    </div>
                </>
            )}
        </section>
    );

}
