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
    startDate: Date;
    endDate: Date;
    eventTypeOption?: SelectOption;
};

const TODAYS_DATE = new Date();
const DATE_IN_10_YEARS = new Date(new Date().setFullYear(new Date().getFullYear() + 10));

export const CreateEvent: React.FC = () => {
    const history = useHistory();
    const { handleSubmit, register, errors, control, watch } = useForm<FormData>({
        defaultValues: {
            // eventTypeOption: { label: "", value: "" },
        },
    });
    const dateWatch = watch(["startDate", "endDate"]);

    const onCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        history.push("/");
    };
    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const { eventName, organization, startDate, endDate, eventTypeOption } = data;
        const event: TsrEvent = {
            eventName,
            organization,
            startDate: startDate.toJSON(),
            endDate: endDate.toJSON(),
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
