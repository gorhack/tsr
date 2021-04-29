import React, { ReactElement, useCallback, useEffect, useReducer, useState } from "react";
import { emptyTsrUser, getUserInfo, setUserSettings, TsrUser, TsrUserSettings } from "./UserApi";
import { Option } from "../api";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import {
    Organization,
    OrganizationActionTypes,
    OrgCacheReducerAction,
} from "../Organization/OrganizationApi";
import { OrgSelect } from "../Organization/OrgSelect";
import { LinkButton, PrimaryButton, SecondaryButton } from "../Buttons/Buttons";
import "../Form.css";
import "./UserSettings.css";
import { LabeledInput } from "../Inputs/LabeledInput";
import sortedUniqBy from "lodash/sortedUniqBy";
import { useHistory } from "react-router-dom";

interface FormData extends FieldValues {
    email: string;
    phone: string;
    organizationOption: Option[];
}

export const UserSettings: React.FC = (): ReactElement => {
    const history = useHistory();

    const orgCacheReducer = (state: Organization[], action: OrgCacheReducerAction) => {
        if (action.type === OrganizationActionTypes.LOAD) {
            return sortedUniqBy<Organization>(
                [...state, ...action.organizations],
                (e) => e.sortOrder,
            );
        } else {
            return state;
        }
    };
    const [organizationsCache, organizationCacheDispatch] = useReducer(orgCacheReducer, []);

    const [user, setUser] = useState<TsrUser>(emptyTsrUser);
    const [orgValues, setOrgValues] = useState<Option[]>([]);
    const {
        control,
        handleSubmit,
        setValue,
        register,
        formState: { errors },
    } = useForm<FieldValues>({
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
            if (settings.emailAddress) {
                setValue("email", settings.emailAddress);
            }
            if (settings.phoneNumber) {
                setValue("phone", settings.phoneNumber);
            }
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
            await setUserSettings(settingsToSave);
            history.push("/");
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
            <LinkButton onClick={() => history.push("/")}>{"< back to events"}</LinkButton>
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
                            ...register("phone", {
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
                            ...register("email", {
                                maxLength: 255,
                            }),
                        }}
                        error={errors.email && "email address can be a maximum of 255 characters"}
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
