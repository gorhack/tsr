import React, { ReactElement, ReactFragment, useContext, useEffect } from "react";
import "./PrimaryNavigation.css";
import { DrawerMenu } from "./DrawerMenu";
import TrackedName from "../Icons/TrackedName.svg";
import UserContext from "../Users/UserContext";

interface PrimaryNavigationProps {
    children?: ReactFragment;
}

export const PrimaryNavigation: React.FC<PrimaryNavigationProps> = ({
    children,
}: PrimaryNavigationProps): ReactElement => {
    const tsrUser = useContext(UserContext);

    useEffect(() => {
        if (tsrUser === undefined) {
            return;
        }
    }, [tsrUser]);

    if (tsrUser === undefined) {
        return <></>;
    }

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
