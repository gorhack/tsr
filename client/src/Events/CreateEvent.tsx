import React from "react";
import { LabeledInput } from "../Inputs/LabeledInput";
import { useHistory } from "react-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { saveEvent, TsrEvent } from "./EventApi";
import { SelectOption } from "../api";
import { FormDatePicker } from "../Inputs/FormDatePicker";

type FormData = {
    eventName: string;
    organization: string;
    startDate: string;
    endDate: string;
    eventTypeOption?: SelectOption;
};

export const CreateEvent: React.FC = () => {
    const history = useHistory();
    const { handleSubmit, register, errors, control } = useForm<FormData>({
        defaultValues: {
            // eventTypeOption: { label: "", value: "" },
        },
    });

    const onCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        history.push("/");
    };
    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const { eventName, organization, startDate, endDate, eventTypeOption } = data;
        const event: TsrEvent = {
            eventName,
            organization,
            startDate,
            endDate,
            eventType: eventTypeOption
                ? {
                      sortOrder: 1,
                      eventName: eventTypeOption.value,
                      displayName: eventTypeOption.value,
                  }
                : undefined,
        };
        try {
            const savedEvent = await saveEvent(event);
            history.push(`/${savedEvent.eventId}`);
        } catch (e) {
            console.log("error saving the event", e.message);
        }
    };

    return (
        <div>
            <h1>create an event</h1>
            <form title="createEventForm" onSubmit={handleSubmit(onSubmit)}>
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
                    minDate={new Date()}
                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 10))}
                    error={errors.startDate && "start date is required MM/dd/YYYY"}
                />
                <LabeledInput
                    label={"select the end date"}
                    inputProps={{
                        placeholder: "end date",
                        name: "endDate",
                        ref: register({}),
                    }}
                />
                <LabeledInput
                    label={"select the event type"}
                    inputProps={{
                        placeholder: "event type",
                        name: "eventType",
                        ref: register({}),
                    }}
                />
                <button>create event</button>
                <button onClick={onCancel}>cancel</button>
            </form>
        </div>
    );
};
