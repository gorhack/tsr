import React, { ReactElement } from "react";
import AsyncCreatable from "react-select/async-creatable";
import { selectStyles } from "../Styles";
import { createFilter, ValueType } from "react-select";
import { loadOrganizationSearchTerm, Option } from "../api";
import { Control, Controller } from "react-hook-form";
import { createOrganization, Organization } from "./OrganizationApi";

interface OrgSelectProps {
    control: Control;
    setCache: React.Dispatch<React.SetStateAction<Organization[]>>;
    selectedOrgs: Option[];
    setSelectedOrgs: React.Dispatch<React.SetStateAction<Option[]>>;
}

export const OrgSelect = ({
    control,
    setCache,
    selectedOrgs,
    setSelectedOrgs,
}: OrgSelectProps): ReactElement => {
    const loadOrganizations = (searchTerm: string): Promise<Option[]> => {
        return loadOrganizationSearchTerm(searchTerm, setCache);
    };

    const createAndMapOrganization = (inputVal: string): void => {
        (async () =>
            createOrganization({
                organizationId: 0,
                organizationName: inputVal,
                organizationDisplayName: inputVal,
                sortOrder: 0,
            })
                .then((result) => {
                    setCache((oldCache) => [...oldCache, result]);
                })
                .catch((error) => {
                    console.error(`unable to create organization ${inputVal}: ${error.message}`);
                }))();
    };

    return (
        <Controller
            name="organizationOption"
            control={control}
            defaultValue={selectedOrgs}
            render={(props): ReactElement => (
                <>
                    <label
                        data-testid="organization-select"
                        htmlFor="organizations"
                        style={{ textAlign: "initial" }}
                    >
                        organizations
                    </label>
                    <div className={"space-1"} />
                    <AsyncCreatable
                        styles={selectStyles}
                        loadOptions={loadOrganizations}
                        defaultOptions
                        isClearable
                        isMulti
                        placeholder="Select Organizations..."
                        name="organizations"
                        inputId="organizations"
                        value={selectedOrgs}
                        getOptionValue={(option) => option.label}
                        onChange={(selection: ValueType<Option>, actionType): void => {
                            if (selection && actionType.action === "create-option") {
                                if ("label" in selection) {
                                    createAndMapOrganization(selection.label);
                                }
                            }
                            const newValuesOrEmpty = (selection || []) as Option[];
                            setSelectedOrgs(newValuesOrEmpty);
                            props.onChange(selection);
                        }}
                    />
                </>
            )}
            filterOption={createFilter({
                ignoreCase: true,
                matchFrom: "any",
            })}
        />
    );
};
