import React, { useCallback, useEffect, useReducer, useState } from "react";
import { FormDatePicker } from "../Inputs/FormDatePicker";
import {
    currentDate,
    datePlusYears,
    eventTypesCacheReducer,
    MAX_NAME_LENGTH,
    Option,
    orgCacheReducer,
} from "../api";
import { FieldValues, SubmitHandler, useForm, useWatch } from "react-hook-form";
import { CreatableTsrEvent, TsrEvent } from "./EventApi";
import { EventTypeSelect } from "./Type/EventType";
import { PrimaryButton, SecondaryButton } from "../Buttons/Buttons";
import { LabeledInput } from "../Inputs/LabeledInput";
import { OrgSelect } from "../Organization/OrgSelect";
import { Organization, OrganizationActionTypes } from "../Organization/OrganizationApi";
import { isTsrEvent } from "./CreateEvent";

type FormData = {
    eventName: string;
    organizationOption: Option[];
    startDate: Date;
    endDate: Date;
    eventTypeOption?: Option;
};

interface EventFormProps<E extends CreatableTsrEvent | TsrEvent> {
    event: E;
    formHeader: string;
    onCancel: () => void;
    submitData: (data: E) => void;
}

export function EventForm<E extends CreatableTsrEvent | TsrEvent>({
    event,
    formHeader,
    onCancel,
    submitData,
}: EventFormProps<E>) {
    const [organizationsCache, organizationCacheDispatch] = useReducer(orgCacheReducer, []);
    const [orgValues, setOrgValues] = useState<Option[]>([]);
    const [eventTypesCache, eventTypesCacheDispatch] = useReducer(eventTypesCacheReducer, []);
    const [eventTypeValue, setEventTypeValue] = useState<Option | undefined>(undefined);

    const {
        handleSubmit,
        register,
        control,
        setValue,
        setError,
        formState: { errors },
    } = useForm<FieldValues>({
        defaultValues: {
            eventTypeOption: eventTypeValue,
            organizationOption: orgValues,
        },
    });

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
        if (isTsrEvent(event)) {
            organizationCacheDispatch({
                type: OrganizationActionTypes.LOAD,
                organizations: event.organizations,
            });
            setFormValues(event);
        }
    }, []);

    const startDateWatch = useWatch({ control, name: "startDate", defaultValue: "" });
    const endDateWatch = useWatch({ control, name: "endDate", defaultValue: "" });

    const onSubmit: SubmitHandler<FormData> = (data) => {
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

        const tsrEventToUpdate = {
            ...event,
            eventName,
            organizations: foundOrgs,
            startDate: startDate.toJSON(),
            endDate: endDate.toJSON(),
            eventType: foundEventType,
        };
        submitData(tsrEventToUpdate);
    };

    return (
        <>
            <div className={"CreateEvent-Content"}>
                <h1>{formHeader}</h1>
                <form
                    data-testid={"create-event-form"}
                    className={"Form-Content"}
                    title="createEventForm"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <LabeledInput
                        label={"event name"}
                        error={
                            errors.eventName &&
                            "event name is required and must be less than 255 characters"
                        }
                        inputProps={{
                            placeholder: "Enter Event Name...",
                            ...register("eventName", {
                                required: true,
                                maxLength: MAX_NAME_LENGTH,
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

                    <EventTypeSelect
                        selectedEventType={eventTypeValue}
                        control={control}
                        dispatchToEventTypeCache={eventTypesCacheDispatch}
                        setSelectedEventType={setEventTypeValue}
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
}
