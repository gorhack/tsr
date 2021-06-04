import React, { useContext, useEffect } from "react";
import UserContext from "../Users/UserContext";

const OrganizationSettings: React.FC = () => {
    const tsrUser = useContext(UserContext);

    useEffect(() => {
        if (tsrUser === undefined) {
            return;
        }
    }, [tsrUser]);

    if (tsrUser === undefined) {
        return <></>;
    }

    if (tsrUser.settings.organizations === undefined) {
        console.log("no orgs");
    }

    return (
        <>
            <h1 className="UserSettings-Header">{`${tsrUser.username} organization settings`}</h1>
            <p>Role: {tsrUser.role}</p>
            <p>{tsrUser.settings.organizations}</p>
        </>
    );
};

export default OrganizationSettings;
