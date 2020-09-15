import React, { ReactElement, useEffect, useState } from "react";
import { getUserInfo, TsrUser } from "./UserApi";
import { Option } from "../api";
import { useForm } from "react-hook-form";
import { Organization } from "../Organization/OrganizationApi";
import { OrgSelect } from "../Organization/OrgSelect";

type FormData = {
    // TODO email: string;
    // TODO phone: string;
    organizationOption: Option[];
};

export const UserSettings: React.FC = (): ReactElement => {
    const [organizationsCache, setOrganizationsCache] = useState<Organization[]>([]);
    const [user, setUser] = useState<TsrUser>({
        userId: "",
        username: "",
        role: "USER",
        organizations: [],
    });
    const [orgValues, setOrgValues] = useState<Option[]>([]);
    const { control } = useForm<FormData>({
        defaultValues: {
            organizationOption: [],
        },
    });

    useEffect(() => {
        (async () => {
            await getUserInfo()
                .then((result) => {
                    setUser(result);
                    const orgsAsOptions: Option[] = result.organizations.map((org) => {
                        return {
                            value: org.organizationDisplayName,
                            label: org.organizationDisplayName,
                        };
                    });
                    setOrgValues(orgsAsOptions);
                })
                .catch((error) => {
                    console.error(`unable to get current user ${error.message}`);
                });
        })();
    }, [setUser]);

    return (
        <>
            <h1 className="UserSettings-Header">{`${user.username} settings`}</h1>
            <div className="UserSettings-Content">
                <form
                    className="UserSettings-Form"
                    title="userSettingsForm"
                    onSubmit={() => {
                        // do nothing
                    }}
                >
                    <OrgSelect
                        control={control}
                        setCache={setOrganizationsCache}
                        selectedOrgs={orgValues}
                        setSelectedOrgs={setOrgValues}
                    />
                </form>
            </div>
        </>
    );
};
UserSettings.displayName = "UserSettings";
