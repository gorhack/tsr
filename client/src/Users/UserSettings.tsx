import React, { ReactElement, useEffect, useState } from "react";
import { getUserInfo, TsrUser } from "./UserApi";

export const UserSettings: React.FC = (): ReactElement => {
    const [user, setUser] = useState<TsrUser>({
        userId: "",
        username: "",
        role: "USER",
        organizations: [],
    });

    useEffect(() => {
        (async () => {
            await getUserInfo()
                .then((result) => {
                    setUser(result);
                })
                .catch((error) => {
                    console.error(`unable to get current user ${error.message}`);
                });
        })();
    }, [setUser]);

    return <h1>{`${user.username} settings`}</h1>;
};
UserSettings.displayName = "UserSettings";
