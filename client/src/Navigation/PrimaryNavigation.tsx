import React, { ReactElement, ReactFragment, useEffect, useState } from "react";
import { emptyTsrUser, getUserInfo, TsrUser } from "../Users/UserApi";
import "./PrimaryNavigation.css";
import { DrawerMenu } from "./DrawerMenu";
import TrackedName from "../Icons/TrackedName.svg";

interface PrimaryNavigationProps {
    children?: ReactFragment;
}

export const PrimaryNavigation: React.FC<PrimaryNavigationProps> = ({
    children,
}: PrimaryNavigationProps): ReactElement => {
    const [tsrUser, setTsrUser] = useState<TsrUser>(emptyTsrUser);

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
            <div className="flex-row-wrap">
                <DrawerMenu />
                <img src={TrackedName} alt="Tracked" height="30" />
                <span style={{ fontSize: "42px", paddingRight: "2.5rem" }}>{tsrUser.username}</span>
            </div>
            {children}
        </nav>
    );
};

PrimaryNavigation.displayName = "PrimaryNavigation";
