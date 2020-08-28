import React, { useEffect, useState } from "react";
import { getUserInfo, TsrUser } from "./UserApi";

export const User: React.FC = () => {
    const [tsrUser, setTsrUser] = useState<TsrUser>({
        userId: "",
        username: "",
        role: "USER",
    });

    useEffect((): void => {
        (async (): Promise<void> => {
            try {
                const user = await getUserInfo();
                setTsrUser(user);
            } catch (e) {
                console.error(`error retrieving user, ${e.message.error}`);
            }
        })();
    }, []);

    return (
        <div>
            <div>{tsrUser.userId}</div>
            <div>{tsrUser.username}</div>
        </div>
    );
};
