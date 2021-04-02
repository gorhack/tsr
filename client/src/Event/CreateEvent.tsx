import React, { ReactElement, useCallback, useEffect, useReducer, useState } from "react";
import { LabeledInput } from "../Inputs/LabeledInput";
import { useHistory } from "react-router";
import { Controller, FieldValues, SubmitHandler, useForm, useWatch } from "react-hook-form";
import AsyncCreatable from "react-select/async-creatable";
import { createFilter } from "react-select";
import { CreatableTsrEvent, getEventById, saveEvent, TsrEvent, updateEvent } from "./EventApi";
import { currentDate, datePlusYears, Option, orgCacheReducer } from "../api";
import { FormDatePicker } from "../Inputs/FormDatePicker";
import "./CreateEvent.css";
import "../Form.css";
import { selectStyles } from "../Styles";
import { createEventType, EventType, getEventTypeContains } from "./Type/EventTypeApi";
import { Organization, OrganizationActionTypes } from "../Organization/OrganizationApi";
import sortedUniqBy from "lodash/sortedUniqBy";
import { LinkButton, PrimaryButton, SecondaryButton } from "../Buttons/Buttons";
import { OrgSelect } from "../Organization/OrgSelect";
import { useParams } from "react-router-dom";
import { RouteParams } from "./EventPage";

type FormData = {
    eventName: string;
    organizationOption: Option[];
    startDate: Date;
    endDate: Date;
    eventTypeOption?: Option;
};

export const CreateEvent: React.FC = () => {
    const history = useHistory();
    const { eventId } = useParams<RouteParams>();

    const [organizationsCache, organizationCacheDispatch] = useReducer(orgCacheReducer, []);
    const [orgValues, setOrgValues] = useState<Option[]>([]);
    const [eventTypeValue, setEventTypeValue] = useState<Option | undefined>(undefined);

    const [eventTypesCache, setEventTypesCache] = useState<EventType[]>([]);
    // TODO fill in empty tsr event
    const [tsrEvent, setTsrEvent] = useState<TsrEvent>();

    const {
        handleSubmit,
        register,
        control,
        setError,
        setValue,
        formState: { errors },
    } = useForm<FieldValues>({
        defaultValues: {
            eventTypeOption: { value: "", label: "" },
            organizationOption: orgValues,
        },
    });
    const startDateWatch = useWatch({ control, name: "startDate", defaultValue: "" });
    const endDateWatch = useWatch({ control, name: "endDate", defaultValue: "" });

    const setFormValues = useCallback(
        (event: TsrEvent): void => {
            const orgsAsOptions: Option[] = event.organizations.map((org) => {
                return {
                    value: org.organizationDisplayName,
                    label: org.organizationDisplayName,
                };
            });
            if (event.eventType?.displayName) {
                setEventTypeValue({
                    value: event.eventType?.displayName,
                    label: event.eventType?.displayName,
                });
            }
            setOrgValues(orgsAsOptions);
            setValue("startDate", new Date(event.startDate));
            setValue("endDate", new Date(event.endDate));
            setValue("eventName", event.eventName);
        },
        [setValue, setOrgValues],
    );

    useEffect(() => {
        if (!eventId) {
            return;
        }
        (async () => {
            await getEventById(parseInt(eventId))
                .then((event) => {
                    setTsrEvent(event);
                    organizationCacheDispatch({
                        type: OrganizationActionTypes.LOAD,
                        organizations: event.organizations,
                    });
                    setFormValues(event);
                })
                .catch((error) => {
                    console.error(`error getting event by id ${eventId}, ${error.message.value}`);
                });
        })();
    }, [eventId, setFormValues, setTsrEvent]);

    const onCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        if (history.location.pathname.startsWith(`/editEvent/${eventId}`)) {
            history.push(`/event/${eventId}`);
        } else {
            history.push("/");
        }
    };

    const onSubmit: SubmitHandler<FormData> = async (data): Promise<void> => {
        const { eventName, startDate, endDate } = data;
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
        const foundEventType = eventTypesCache.find(
            (eventType) => eventType.displayName === eventTypeValue?.label,
        );

        if (foundOrgs.length === 0) {
            setError("organizationOption", {
                message: "must select an organization",
                type: "required",
            });
            return;
        }

        if (tsrEvent) {
            const tsrEventToUpdate: TsrEvent = {
                ...tsrEvent,
                eventName,
                organizations: foundOrgs,
                startDate: startDate.toJSON(),
                endDate: endDate.toJSON(),
                eventType: foundEventType,
            };
            await updateEvent(tsrEventToUpdate)
                .then((result) => {
                    history.push(`/event/${result.eventId}`);
                })
                .catch((error) => {
                    console.error("error saving the event", error.message);
                });
        } else {
            const tsrEventToSave: CreatableTsrEvent = {
                eventName,
                organizations: foundOrgs,
                startDate: startDate.toJSON(),
                endDate: endDate.toJSON(), // TODO: fix time of event
                eventType: foundEventType,
            };
            await saveEvent(tsrEventToSave)
                .then((result) => {
                    history.push(`/event/${result.eventId}`);
                })
                .catch((error) => {
                    console.error("error saving the event", error.message);
                });
        }
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
                    setEventTypeValue({ value: result.displayName, label: result.displayName });
                })
                .catch((error) => {
                    console.error(`unable to create event type ${inputVal}: ${error.message}`);
                }))();
    };

    const createEventHeader = eventId ? (
        <h1 className="CreateEvent-Header">edit event</h1>
    ) : (
        <h1 className="CreateEvent-Header">create an event</h1>
    );

    return (
        <>
            <LinkButton onClick={() => history.push("/")}>{"< back to events"}</LinkButton>
            {createEventHeader}
            <div className={"CreateEvent-Content"}>
                <form
                    data-testid={"create-event-form"}
                    className={"Form-Content"}
                    title="createEventForm"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <LabeledInput
                        label={"event name"}
                        error={errors.eventName && "event name is required"}
                        inputProps={{
                            placeholder: "Enter Event Name...",
                            ...register("eventName", {
                                required: true,
                            }),
                        }}
                    />
                    <span className={"space-2"} />
                    <OrgSelect
                        control={control}
                        dispatchToOrgCache={organizationCacheDispatch}
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
                        name="startDate"
                        label="start date"
                        placeholder="Choose the Start Date..."
                        minDate={currentDate()}
                        maxDate={datePlusYears(10)}
                        error={errors.startDate && "start date is required MM/dd/YYYY"}
                    />
                    <span className={"space-2"} />

                    <FormDatePicker
                        control={control}
                        name="endDate"
                        label="end date"
                        placeholder="Choose the End Date..."
                        minDate={startDateWatch ? startDateWatch : currentDate()}
                        maxDate={
                            startDateWatch
                                ? new Date(
                                      new Date(startDateWatch.toString()).setFullYear(
                                          startDateWatch.getFullYear() + 10,
                                      ),
                                  )
                                : datePlusYears(10)
                        }
                        error={
                            !!(errors.endDate || startDateWatch > endDateWatch)
                                ? "end date after the start date is required MM/dd/YYYY"
                                : undefined
                        }
                    />
                    <span className={"space-2"} />

                    <Controller
                        control={control}
                        name="eventTypeOption"
                        defaultValue={eventTypeValue}
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
                                    defaultValue={eventTypeValue}
                                    defaultOptions
                                    loadOptions={loadEventTypeSearchTerm}
                                    getOptionValue={(option) => option.label}
                                    placeholder="Select an Event Type..."
                                    name="eventType"
                                    value={eventTypeValue}
                                    inputId="eventType"
                                    onCreateOption={createAndMapEventType}
                                    onChange={(selection): void => {
                                        const newValuesOrEmpty = (selection || undefined) as Option;
                                        setEventTypeValue(newValuesOrEmpty);
                                        props.field.onChange(selection);
                                    }}
                                    filterOption={createFilter({
                                        ignoreCase: true,
                                        matchFrom: "any",
                                    })}
                                />
                            </>
                        )}
                    />
                    <span className={"space-2"} />
                    <div className="Form-Submit">
                        <PrimaryButton>submit</PrimaryButton>
                        <SecondaryButton onClick={onCancel}>cancel</SecondaryButton>
                    </div>
                </form>
            </div>
        </>
    );
};
