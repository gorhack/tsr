import React, { ReactElement, ReactFragment, useEffect, useState } from "react";
import { getUserInfo, TsrUser } from "./Users/UserApi";
import "./PrimaryNavigation.css";

interface PrimaryNavigationProps {
    children?: ReactFragment;
}

export const PrimaryNavigation: React.FC<PrimaryNavigationProps> = ({
    children,
}: PrimaryNavigationProps): ReactElement => {
    const [tsrUser, setTsrUser] = useState<TsrUser>({
        userId: "",
        username: "[deleted]",
        role: "USER",
    });

    useEffect(() => {
        (async () => {
            await getUserInfo()
                .then((result) => {
                    setTsrUser(result);
                })
                .catch((error) => {
                    console.error(`unable to get user info ${error.message}`);
                });
        })();
    }, [setTsrUser]);

    return (
        <nav className="PrimaryNavigation">
            <div className="PrimaryNavigationInfo">
                <span>{tsrUser.username}</span>
                <span>{tsrUser.role}</span>
            </div>
            {children}
        </nav>
    );
};

PrimaryNavigation.displayName = "PrimaryNavigation";
