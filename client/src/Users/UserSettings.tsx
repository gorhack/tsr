import React, { ReactElement, useEffect, useState } from "react";
import { getUserInfo, setUserSettings, TsrUser, TsrUserSettings } from "./UserApi";
import { Option } from "../api";
import { SubmitHandler, useForm } from "react-hook-form";
import { Organization } from "../Organization/OrganizationApi";
import { OrgSelect } from "../Organization/OrgSelect";
import { PrimaryButton, SecondaryButton } from "../Buttons/Buttons";
import "../Form.css";

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
            organizationOption: orgValues,
        },
    });

    const mapOrgsToOptions = (organizations: Organization[]): void => {
        const orgsAsOptions: Option[] = organizations.map((org) => {
            return {
                value: org.organizationDisplayName,
                label: org.organizationDisplayName,
            };
        });
        setOrgValues(orgsAsOptions);
    };

    useEffect((): void => {
        (async () => {
            await getUserInfo()
                .then((result) => {
                    setUser(result);
                    mapOrgsToOptions(result.organizations);
                })
                .catch((error) => {
                    console.error(`unable to get current user ${error.message}`);
                });
        })();
    }, [setUser]);

    const onSubmit: SubmitHandler<FormData> = async (data): Promise<void> => {
        const { organizationOption } = data;
        let foundOrgs: Organization[] = [];
        organizationOption.forEach((orgOption): void => {
            organizationsCache.find((org) => {
                if (org.organizationDisplayName === orgOption.label) {
                    foundOrgs = [...foundOrgs, org];
                }
                return undefined;
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
        mapOrgsToOptions(user.organizations);
    };

    return (
        <>
            <h1 className="UserSettings-Header">{`${user.username} settings`}</h1>
            <div className="UserSettings-Content">
                <form
                    className="Form-Content"
                    title="userSettingsForm"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <OrgSelect
                        control={control}
                        setCache={setOrganizationsCache}
                        selectedOrgs={orgValues}
                        setSelectedOrgs={setOrgValues}
                    />
                    <div className="space-2" />
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
