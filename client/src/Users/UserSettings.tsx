import React, { ReactElement, useEffect, useState } from "react";
import { getUserInfo, setUserSettings, TsrUser, TsrUserSettings } from "./UserApi";
import { Option } from "../api";
import { SubmitHandler, useForm } from "react-hook-form";
import { Organization } from "../Organization/OrganizationApi";
import { OrgSelect } from "../Organization/OrgSelect";
import { PrimaryButton, SecondaryButton } from "../Buttons/Buttons";
import "../Event/CreateEvent.css";

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
    const { control, handleSubmit } = useForm<FormData>({
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

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const { organizationOption } = data;
        let foundOrgs: Organization[] = [];
        organizationOption.forEach((orgOption) => {
            organizationsCache.find((org) => {
                if (org.organizationDisplayName === orgOption.label) {
                    foundOrgs = [...foundOrgs, org];
                }
            });
        });
        const settingsToSave: TsrUserSettings = {
            organizations: foundOrgs,
        };
        try {
            const updatedUser = await setUserSettings(settingsToSave);
            setUser(updatedUser);
        } catch (error) {
            console.error(`error saving your settings, ${error.message}`);
        }
    };
    const onCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        // TODO reset values
    };

    return (
        <>
            <h1 className="UserSettings-Header">{`${user.username} settings`}</h1>
            <div className="UserSettings-Content">
                <form
                    className="UserSettings-Form"
                    title="userSettingsForm"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <OrgSelect
                        control={control}
                        setCache={setOrganizationsCache}
                        selectedOrgs={orgValues}
                        setSelectedOrgs={setOrgValues}
                    />
                    <div className="Form-Submit">
                        <PrimaryButton>save</PrimaryButton>
                        <SecondaryButton onClick={onCancel}>cancel</SecondaryButton>
                    </div>
                </form>
            </div>
        </>
    );
};
UserSettings.displayName = "UserSettings";
