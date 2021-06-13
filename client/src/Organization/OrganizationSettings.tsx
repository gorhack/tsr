import React, { useContext, useEffect } from "react";
import UserContext from "../Users/UserContext";

const OrganizationSettings: React.FC = () => {
    const tsrUser = useContext(UserContext);
    const url = window.location.href;
    const orgPath = url.length - 1;
    const orgId = url[orgPath];

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
        <div className="Event-Details-Container">
            <h1 className="UserSettings-Header">{`${tsrUser.username} organization: ${orgId} settings`}</h1>
            <div className="space-3" />
            <form>
                <h2>Role</h2>
                <select defaultValue={undefined}>
                    <option>---</option>
                    <option value={`${tsrUser.userId}:${url}`}>Resourcer</option>
                </select>
                <div className="space-3" />
            </form>
        </div>
    );
};

export default OrganizationSettings;
