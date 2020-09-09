import React, { ReactElement, useEffect, useState } from "react";
import { LabeledInput } from "../Inputs/LabeledInput";
import { useHistory } from "react-router";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import AsyncCreatable from "react-select/async-creatable";
import Select, { createFilter } from "react-select";
import { EditableTsrEvent, saveEvent } from "./EventApi";
import { SelectOption } from "../api";
import { FormDatePicker } from "../Inputs/FormDatePicker";
import "./CreateEvent.css";
import { selectStyles } from "../Styles";
import { getOrganizationNames, Organization } from "../Organization/OrganizationApi";
import { EventType, getEventTypeContains, getEventTypes } from "./Type/EventTypeApi";
import sortedUniqBy from "lodash/sortedUniqBy";

type FormData = {
    eventName: string;
    orgNameOption: SelectOption;
    startDate: Date;
    endDate: Date;
    eventTypeOption?: SelectOption;
};

const TODAYS_DATE = new Date();
const DATE_IN_10_YEARS = new Date(new Date().setFullYear(new Date().getFullYear() + 10));

export const CreateEvent: React.FC = () => {
    const history = useHistory();
    const initialEventType = { id: 0, label: "" };
    const initialOrgName = { id: 0, label: "" };

    const [eventTypesCache, setEventTypesCache] = useState<EventType[]>([]);

    const [orgNames, setOrgNames] = useState<Organization[]>([]);
    const [orgNameOptions, setOrgNameOptions] = useState<SelectOption[]>([]);

    const { handleSubmit, register, errors, control, watch, setError } = useForm<FormData>({
        defaultValues: {
            eventTypeOption: initialEventType,
            orgNameOption: initialOrgName,
        },
    });
    const dateWatch = watch(["startDate", "endDate"]);

    useEffect(() => {
        (async () => {
            await getOrganizationNames()
                .then((result) => {
                    setOrgNames(result);
                    const newOrgNameOptions: SelectOption[] = [...result]
                        .sort((e, e2) => e.sortOrder - e2.sortOrder)
                        .map((orgName) => {
                            return {
                                id: orgName.organizationId,
                                label: orgName.organizationDisplayName,
                            };
                        });
                    setOrgNameOptions(newOrgNameOptions);
                })
                .catch((error) => {
                    console.error("error getting organization names ", error.message);
                });
        })();
    }, [setEventTypesCache, setOrgNames, setOrgNameOptions]);

    const onCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        history.push("/");
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const { eventName, orgNameOption, startDate, endDate, eventTypeOption } = data;
        const foundOrg = orgNames.find((orgName) => orgName.organizationId === orgNameOption.id);
        if (!foundOrg) {
            setError("orgNameOption", { message: "must select an organization", type: "required" });
            return;
        }

        const tsrEvent: EditableTsrEvent = {
            eventName,
            organization: foundOrg,
            startDate: startDate.toJSON(),
            endDate: endDate.toJSON(),
            eventType: eventTypesCache.find(
                (eventType) => eventType.eventTypeId === eventTypeOption?.id,
            ),
        };
        await saveEvent(tsrEvent)
            .then((result) => {
                history.push(`/event/${result.eventId}`);
            })
            .catch((error) => {
                console.error("error saving the event", error.message);
            });
    };

    const mapEventTypeToOptions = (eventTypes: EventType[]): SelectOption[] => {
        return eventTypes.map((eventType) => {
            return {
                id: eventType.eventTypeId,
                label: eventType.displayName,
            };
        });
    };

    const loadEventTypeSearchTerm = async (searchTerm: string): Promise<SelectOption[]> => {
        if (searchTerm === "") {
            return getEventTypes()
                .then((result) => {
                    setEventTypesCache(result.items);
                    return Promise.resolve(mapEventTypeToOptions(result.items));
                })
                .catch((error) => {
                    console.error("error loading default event types ", error.message);
                    return Promise.resolve([]);
                });
        } else {
            return getEventTypeContains(searchTerm)
                .then((result) => {
                    setEventTypesCache((oldCache) => {
                        return sortedUniqBy<EventType>(
                            [...oldCache, ...result.items],
                            (e) => e.sortOrder,
                        );
                    });
                    return Promise.resolve(mapEventTypeToOptions(result.items));
                })
                .catch((error) => {
                    console.error(
                        `error loading event types with search term ${searchTerm} ${error.message}`,
                    );
                    return Promise.resolve([]);
                });
        }
    };

    return (
        <div className={"CreateEvent-Content"}>
            <h1>create an event</h1>
            <form
                className={"CreateEvent-Form"}
                title="createEventForm"
                onSubmit={handleSubmit(onSubmit)}
            >
                <LabeledInput
                    label={"event name"}
                    error={errors.eventName && "event name is required"}
                    inputProps={{
                        placeholder: "Enter Event Name...",
                        name: "eventName",
                        ref: register({
                            required: true,
                        }),
                    }}
                />
                <span className={"space-2"} />

                <label data-testid="org-name-select" htmlFor="orgName">
                    <div className={"space-1"} style={{ textAlign: "initial" }}>
                        organization name
                    </div>
                    <Controller
                        name="orgNameOption"
                        control={control}
                        defaultValue={initialOrgName}
                        rules={{ required: true }}
                        render={(props): ReactElement => (
                            <>
                                <Select
                                    styles={selectStyles}
                                    options={orgNameOptions}
                                    isClearable={true}
                                    placeholder="Select Organizations..."
                                    inputId="organizationName"
                                    onChange={(selection): void => {
                                        props.onChange(selection);
                                    }}
                                />
                                {errors.orgNameOption ? (
                                    <div className={"error-message React-Select-Error"}>
                                        {"Must select an organization."}
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </>
                        )}
                        filterOption={createFilter({
                            ignoreCase: true,
                            matchFrom: "any",
                        })}
                    />
                </label>
                <span className={"space-2"} />

                <FormDatePicker
                    control={control}
                    name={"startDate"}
                    label={"start date"}
                    placeholder={"Choose the Start Date..."}
                    minDate={TODAYS_DATE}
                    maxDate={DATE_IN_10_YEARS}
                    error={errors.startDate && "start date is required MM/dd/YYYY"}
                />
                <span className={"space-2"} />

                <FormDatePicker
                    control={control}
                    name={"endDate"}
                    label={"end date"}
                    placeholder={"Choose the End Date..."}
                    minDate={dateWatch.startDate ? dateWatch.startDate : TODAYS_DATE}
                    maxDate={
                        dateWatch.startDate
                            ? new Date(
                                  new Date(dateWatch.startDate.toString()).setFullYear(
                                      dateWatch.startDate.getFullYear() + 10,
                                  ),
                              )
                            : DATE_IN_10_YEARS
                    }
                    error={
                        !!(errors.endDate || dateWatch.startDate > dateWatch.endDate)
                            ? "end date after the start date is required MM/dd/YYYY"
                            : undefined
                    }
                />
                <span className={"space-2"} />

                <label data-testid="event-type-select" htmlFor="eventType">
                    <div className={"space-1"} style={{ textAlign: "initial" }}>
                        event type
                    </div>
                    <Controller
                        name="eventTypeOption"
                        control={control}
                        defaultValue={initialEventType}
                        render={(props): ReactElement => (
                            <AsyncCreatable
                                onCreateOption={(val) => console.log("TODO create ", val)} // TODO create eventType
                                styles={selectStyles}
                                defaultOptions
                                loadOptions={loadEventTypeSearchTerm}
                                isClearable={true}
                                placeholder="Select an Event Type..."
                                inputId="eventType"
                                onChange={(selection): void => {
                                    props.onChange(selection);
                                }}
                            />
                        )}
                        filterOption={createFilter({
                            ignoreCase: true,
                            matchFrom: "any",
                        })}
                    />
                </label>
                <span className={"space-2"} />

                <div>
                    <button className={"basic-button"}>submit</button>
                    <button className={"basic-button"} onClick={onCancel}>
                        cancel
                    </button>
                </div>
            </form>
        </div>
    );
};
