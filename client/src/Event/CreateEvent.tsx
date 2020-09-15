import React, { ReactElement, useState } from "react";
import { LabeledInput } from "../Inputs/LabeledInput";
import { useHistory } from "react-router";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import AsyncCreatable from "react-select/async-creatable";
import { createFilter, ValueType } from "react-select";
import { EditableTsrEvent, saveEvent } from "./EventApi";
import { Option } from "../api";
import { FormDatePicker } from "../Inputs/FormDatePicker";
import "./CreateEvent.css";
import { selectStyles } from "../Styles";
import { createEventType, EventType, getEventTypeContains } from "./Type/EventTypeApi";
import { Organization } from "../Organization/OrganizationApi";
import sortedUniqBy from "lodash/sortedUniqBy";
import { LinkButton, PrimaryButton, SecondaryButton } from "../Buttons/Buttons";
import { OrgSelect } from "../Organization/OrgSelect";

type FormData = {
    eventName: string;
    organizationOption: Option;
    startDate: Date;
    endDate: Date;
    eventTypeOption?: Option;
};

const TODAYS_DATE = new Date();
const DATE_IN_10_YEARS = new Date(new Date().setFullYear(new Date().getFullYear() + 10));

export const CreateEvent: React.FC = () => {
    const history = useHistory();
    const initialEventType = { value: "", label: "" };
    const initialOrgName = { value: "", label: "" };

    const [organizationsCache, setOrganizationsCache] = useState<Organization[]>([]);
    const [orgValues, setOrgValues] = useState<Option[]>([]);

    const [eventTypesCache, setEventTypesCache] = useState<EventType[]>([]);

    const { handleSubmit, register, errors, control, watch, setError } = useForm<FormData>({
        defaultValues: {
            eventTypeOption: initialEventType,
            organizationOption: initialOrgName,
        },
    });
    const dateWatch = watch(["startDate", "endDate"]);

    const onCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        history.push("/");
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const { eventName, startDate, endDate, eventTypeOption } = data;
        // TODO allow multiple orgs
        const foundOrg = organizationsCache.find(
            (orgName) => orgName.organizationDisplayName === orgValues[0]?.label,
        );
        if (!foundOrg) {
            setError("organizationOption", {
                message: "must select an organization",
                type: "required",
            });
            return;
        }

        const tsrEvent: EditableTsrEvent = {
            eventName,
            organization: foundOrg,
            startDate: startDate.toJSON(),
            endDate: endDate.toJSON(),
            eventType: eventTypesCache.find(
                (eventType) => eventType.displayName === eventTypeOption?.label,
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

    const loadEventTypeSearchTerm = async (searchTerm: string): Promise<Option[]> => {
        return getEventTypeContains(searchTerm)
            .then((result) => {
                setEventTypesCache((oldCache) => {
                    return sortedUniqBy<EventType>(
                        [...oldCache, ...result.items],
                        (e) => e.sortOrder,
                    );
                });
                return Promise.resolve(
                    result.items.map((eventType) => {
                        return {
                            value: eventType.displayName,
                            label: eventType.displayName,
                        };
                    }),
                );
            })
            .catch((error) => {
                console.error(
                    `error loading event types with search term ${searchTerm} ${error.message}`,
                );
                return Promise.resolve([]);
            });
    };

    const createAndMapEventType = (inputVal: string): void => {
        (async () =>
            createEventType({
                eventTypeId: 0,
                eventTypeName: inputVal,
                displayName: inputVal,
                sortOrder: 0,
            })
                .then((result) => {
                    setEventTypesCache((oldCache) => [...oldCache, result]);
                })
                .catch((error) => {
                    console.error(`unable to create event type ${inputVal}: ${error.message}`);
                }))();
    };

    return (
        <>
            <LinkButton onClick={() => history.push("/")}>{"< back to events"}</LinkButton>
            <h1 className="CreateEvent-Header">create an event</h1>
            <div className={"CreateEvent-Content"}>
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
                    <OrgSelect
                        control={control}
                        setCache={setOrganizationsCache}
                        selectedOrgs={orgValues}
                        setSelectedOrgs={setOrgValues}
                    />
                    {errors.organizationOption ? (
                        <div className={"error-message React-Select-Error"}>
                            {"Must select an organization."}
                        </div>
                    ) : (
                        <></>
                    )}
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

                    <Controller
                        name="eventTypeOption"
                        control={control}
                        defaultValue={initialEventType}
                        render={(props): ReactElement => (
                            <>
                                <label
                                    data-testid="event-type-select"
                                    htmlFor="eventType"
                                    style={{ textAlign: "initial" }}
                                >
                                    event type
                                </label>
                                <div className={"space-1"} />
                                <AsyncCreatable
                                    styles={selectStyles}
                                    isClearable
                                    defaultOptions
                                    loadOptions={loadEventTypeSearchTerm}
                                    getOptionValue={(option) => option.label}
                                    placeholder="Select an Event Type..."
                                    name="eventType"
                                    inputId="eventType"
                                    onChange={(selection: ValueType<Option>, actionType): void => {
                                        if (selection && actionType.action === "create-option") {
                                            if ("label" in selection) {
                                                createAndMapEventType(selection.label);
                                            }
                                        }
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
                    <span className={"space-2"} />

                    <div className="CreateEvent-Submit">
                        <PrimaryButton>submit</PrimaryButton>
                        <SecondaryButton onClick={onCancel}>cancel</SecondaryButton>
                    </div>
                </form>
            </div>
        </>
    );
};
