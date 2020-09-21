import React, { ReactElement, useCallback, useEffect, useReducer, useState } from "react";
import { emptyTsrUser, getUserInfo, setUserSettings, TsrUser, TsrUserSettings } from "./UserApi";
import { Option } from "../api";
import { SubmitHandler, useForm } from "react-hook-form";
import {
    Organization,
    OrganizationActionTypes,
    OrgCacheReducerAction,
} from "../Organization/OrganizationApi";
import { OrgSelect } from "../Organization/OrgSelect";
import { PrimaryButton, SecondaryButton } from "../Buttons/Buttons";
import "../Form.css";
import "./UserSettings.css";
import { LabeledInput } from "../Inputs/LabeledInput";
import sortedUniqBy from "lodash/sortedUniqBy";

type FormData = {
    email: string;
    phone: string;
    organizationOption: Option[];
};

export const UserSettings: React.FC = (): ReactElement => {
    const orgCacheReducer = (state: Organization[] = [], action: OrgCacheReducerAction) => {
        switch (action.type) {
            case OrganizationActionTypes.LOAD: {
                return sortedUniqBy<Organization>(
                    [...state, ...action.organizations],
                    (e) => e.sortOrder,
                );
            }
            default:
                return state;
        }
    };
    const [organizationsCache, organizationCacheDispatch] = useReducer(orgCacheReducer, []);

    const [user, setUser] = useState<TsrUser>(emptyTsrUser);
    const [orgValues, setOrgValues] = useState<Option[]>([]);
    const { control, handleSubmit, setValue, register, errors } = useForm<FormData>({
        defaultValues: {
            organizationOption: orgValues,
        },
    });

    const setFormValues = useCallback(
        (settings: TsrUserSettings): void => {
            const orgsAsOptions: Option[] = settings.organizations.map((org) => {
                return {
                    value: org.organizationDisplayName,
                    label: org.organizationDisplayName,
                };
            });
            setOrgValues(orgsAsOptions);
            setValue("email", settings.emailAddress);
            setValue("phone", settings.phoneNumber);
        },
        [setOrgValues, setValue],
    );

    useEffect((): void => {
        (async () => {
            await getUserInfo()
                .then((result) => {
                    setUser(result);
                    organizationCacheDispatch({
                        type: OrganizationActionTypes.LOAD,
                        organizations: result.settings.organizations,
                    });
                    setFormValues(result.settings);
                })
                .catch((error) => {
                    console.error(`unable to get current user ${error.message}`);
                });
        })();
    }, [setUser, setFormValues]);

    const onSubmit: SubmitHandler<FormData> = async (data): Promise<void> => {
        const { phone, email } = data;
        let foundOrgs: Organization[] = [];
        orgValues.forEach((orgOption): void => {
            const foundOrg = organizationsCache.find((org) => {
                if (org.organizationDisplayName === orgOption.label) {
                    return org;
                }
                return undefined;
            });
            if (foundOrg) {
                foundOrgs = [...foundOrgs, foundOrg];
            }
        });
        const phoneNumber: string | undefined = phone.trim().length > 0 ? phone.trim() : undefined;
        const emailAddress: string | undefined = email.trim().length > 0 ? email.trim() : undefined;
        const settingsToSave: TsrUserSettings = {
            organizations: foundOrgs,
            phoneNumber: phoneNumber,
            emailAddress: emailAddress,
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
        setFormValues(user.settings);
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
                    <LabeledInput
                        label={"phone number"}
                        inputProps={{
                            placeholder: "Enter Your Phone Number...",
                            name: "phone",
                            ref: register({
                                maxLength: 32,
                            }),
                        }}
                        error={errors.phone && "phone number can be a maximum of 32 characters"}
                    />
                    <span className={"space-2"} />
                    <LabeledInput
                        label={"email address"}
                        inputProps={{
                            placeholder: "Enter Your Email Address...",
                            name: "email",
                            ref: register({
                                maxLength: 254,
                            }),
                        }}
                        error={errors.email && "email address can be a maximum of 254 characters"}
                    />
                    <span className={"space-2"} />
                    <OrgSelect
                        control={control}
                        dispatchToOrgCache={organizationCacheDispatch}
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
