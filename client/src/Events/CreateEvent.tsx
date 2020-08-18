import React from "react";
import { LabeledInput } from "../Inputs/LabeledInput";
import { useHistory } from "react-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { saveEvent, TsrEvent } from "./EventApi";
import { SelectOption } from "../api";

type FormData = {
    eventName?: string;
    organization: string;
    startDate: string;
    endDate: string;
    eventTypeOption?: SelectOption;
};

export const CreateEvent: React.FC = () => {
    const history = useHistory();
    const { handleSubmit, register } = useForm<FormData>({
        defaultValues: {
            eventTypeOption: { label: "", value: "" },
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
                    inputProps={{
                        placeholder: "event name...",
                        name: "eventName",
                        ref: register({}),
                    }}
                />
                <LabeledInput
                    label={"input your organization"}
                    inputProps={{
                        placeholder: "organization...",
                        name: "organization",
                        ref: register({}),
                    }}
                />
                <LabeledInput
                    label={"select the start date"}
                    inputProps={{
                        placeholder: "start date",
                        name: "startDate",
                        ref: register({}),
                    }}
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
