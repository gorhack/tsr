import React, { ReactElement, useEffect, useState } from "react";
import { LabeledInput } from "../Inputs/LabeledInput";
import { useHistory } from "react-router";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Select, { createFilter } from "react-select";
import { EventType, getEventTypes, saveEvent, EditableTsrEvent, TsrEvent } from "./EventApi";
import { SelectOption } from "../api";
import { FormDatePicker } from "../Inputs/FormDatePicker";
import "./CreateEvent.css";

type FormData = {
    eventName: string;
    organization: string;
    startDate: Date;
    endDate: Date;
    eventTypeOption?: SelectOption;
};

const TODAYS_DATE = new Date();
const DATE_IN_10_YEARS = new Date(new Date().setFullYear(new Date().getFullYear() + 10));

export const CreateEvent: React.FC = () => {
    const history = useHistory();
    const initialEventType = { id: 0, label: "" };
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [eventTypeOptions, setEventTypeOptions] = useState<SelectOption[]>([]);
    const { handleSubmit, register, errors, control, watch } = useForm<FormData>({
        defaultValues: {
            eventTypeOption: initialEventType,
        },
    });
    const dateWatch = watch(["startDate", "endDate"]);

    useEffect(() => {
        (async () => {
            try {
                const newEventTypes = await getEventTypes();
                setEventTypes(newEventTypes);
                const newEventTypeOptions: SelectOption[] = newEventTypes
                    .sort((e, e2) => e.sortOrder - e2.sortOrder)
                    .map((eventType) => {
                        return {
                            id: eventType.eventTypeId,
                            label: eventType.displayName,
                        };
                    });
                setEventTypeOptions(newEventTypeOptions);
            } catch (e) {
                console.error("error getting event types", e.message);
            }
        })();
    }, [setEventTypes, setEventTypeOptions]);

    const onCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        history.push("/");
    };
    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const { eventName, organization, startDate, endDate, eventTypeOption } = data;
        const event: EditableTsrEvent = {
            eventName,
            organization,
            startDate: startDate.toJSON(),
            endDate: endDate.toJSON(),
            eventType: eventTypes.find(
                (eventType) => eventType.eventTypeId === eventTypeOption?.id,
            ),
        };
        try {
            const savedEvent: TsrEvent = await saveEvent(event);
            history.push(`/${savedEvent.eventId}`);
        } catch (e) {
            console.error("error saving the event", e.message);
        }
    };

    return (
        <div>
            <h1>create an event</h1>
            <form
                className={"CreateEvent-form"}
                title="createEventForm"
                onSubmit={handleSubmit(onSubmit)}
            >
                <LabeledInput
                    label={"input the event name"}
                    error={errors.eventName && "event name is required"}
                    inputProps={{
                        placeholder: "event name...",
                        name: "eventName",
                        ref: register({
                            required: true,
                        }),
                    }}
                />
                <LabeledInput
                    label={"input your organization"}
                    error={errors.organization && "organization is required"}
                    inputProps={{
                        placeholder: "organization...",
                        name: "organization",
                        ref: register({
                            required: true,
                        }),
                    }}
                />
                <FormDatePicker
                    control={control}
                    name={"startDate"}
                    label={"select the start date"}
                    placeholder={"start date"}
                    minDate={TODAYS_DATE}
                    maxDate={DATE_IN_10_YEARS}
                    error={errors.startDate && "start date is required MM/dd/YYYY"}
                />
                <FormDatePicker
                    control={control}
                    name={"endDate"}
                    label={"select the end date"}
                    placeholder={"end date"}
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
                <label data-testid="event-type-select" htmlFor="eventType">
                    <Controller
                        name="eventTypeOption"
                        control={control}
                        defaultValue={initialEventType}
                        render={(props): ReactElement => (
                            <Select
                                options={eventTypeOptions}
                                isClearable={true}
                                placeholder="select event type"
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
