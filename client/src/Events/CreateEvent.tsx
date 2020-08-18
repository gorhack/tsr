import React from "react";
import { LabeledInput } from "../Inputs/LabeledInput";
import { useHistory } from "react-router";

export const CreateEvent: React.FC = () => {
    const history = useHistory();

    const onCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        history.push("/");
    };
    return (
        <div>
            <h1>create an event</h1>
            <form
                title="createEventForm"
                onSubmit={() => {
                    console.log("submitted form");
                }}
            >
                <LabeledInput
                    label={"input the event name"}
                    inputProps={{
                        placeholder: "event name...",
                    }}
                />
                <LabeledInput
                    label={"input your organization"}
                    inputProps={{
                        placeholder: "organization...",
                    }}
                />
                <LabeledInput
                    label={"select the start date"}
                    inputProps={{
                        placeholder: "start date",
                    }}
                />
                <LabeledInput
                    label={"select the end date"}
                    inputProps={{
                        placeholder: "end date",
                    }}
                />
                <LabeledInput
                    label={"select the event type"}
                    inputProps={{
                        placeholder: "event type",
                    }}
                />
                <button>create event</button>
                <button onClick={onCancel}>cancel</button>
            </form>
        </div>
    );
};
