import React, { useEffect, useState } from "react";
import { getUserInfo, TsrUser } from "./UserApi";

const UserContext = React.createContext<TsrUser | undefined>(undefined);

export const UserContextProvider: React.FC = (props) => {
    const [user, setUser] = useState<TsrUser | undefined>(undefined);

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

    return <UserContext.Provider value={user}>{props.children}</UserContext.Provider>;
};

export default UserContext;
