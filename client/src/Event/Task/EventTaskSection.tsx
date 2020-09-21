import React, { FormEvent, ReactElement, useState } from "react";
import AsyncCreatable from "react-select/async-creatable";
import { PrimaryButton } from "../../Buttons/Buttons";
import { selectStyles } from "../../Styles";
import { Option } from "../../api";
import {
    createEventTask,
    EventTask,
    EventTaskCategory,
    getEventTaskCategoriesContains,
} from "./EventTaskApi";
import "../EventPage.css";
import { TsrEvent } from "../EventApi";
import { ValueType } from "react-select";

interface EventTaskSectionProps {
    tsrEvent: TsrEvent;
}

export const EventTaskSection = ({ tsrEvent }: EventTaskSectionProps): ReactElement => {
    const [selectedTaskOption, setSelectedTaskOption] = useState<Option | undefined>(undefined);
    const [eventTaskCache, setEventTaskCache] = useState<EventTaskCategory[]>([]);
    const [eventTasks, setEventTasks] = useState<EventTask[]>([]);
    const loadEventCategories = async (searchTerm: string): Promise<Option[]> => {
        return getEventTaskCategoriesContains(searchTerm).then((result) => {
            setEventTaskCache((previousCache) => [...previousCache, ...result.items]);
            return Promise.resolve(
                result.items.map((task) => {
                    return {
                        value: task.eventTaskDisplayName,
                        label: task.eventTaskDisplayName,
                    };
                }),
            );
        });
    };

    const addEventTask = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        const foundEventTask = eventTaskCache.find((eventTask) => {
            if (selectedTaskOption?.label === eventTask.eventTaskDisplayName) {
                return eventTask;
            }
            return undefined;
        });
        if (!foundEventTask) {
            console.error("must select a task to add");
            return Promise.resolve();
        }
        await createEventTask(tsrEvent.eventId, foundEventTask)
            .then((result) => {
                setEventTasks((oldTasks) => [...oldTasks, result]);
            })
            .catch((error) => {
                console.error(`could not add event task ${error.message}`);
            });
        setSelectedTaskOption(undefined); // TODO: clear the value in the select
    };

    const displayEventTasks = (): ReactElement => {
        return (
            <>
                {eventTasks.map((eventTask) => {
                    return (
                        <span
                            key={eventTask.eventTaskCategory.eventTaskId}
                            data-testid={`task-${eventTask.eventTaskCategory.eventTaskId}`}
                        >
                            {eventTask.eventTaskCategory.eventTaskDisplayName}
                        </span>
                    );
                })}
            </>
        );
    };

    return (
        <>
            <h2>Event Requirements</h2>
            <div className="space-3" />
            <form onSubmit={addEventTask}>
                <div className="flex-row Event-Detail-Add-Task">
                    <div className="EventPage-AddTask">
                        <label htmlFor="eventTask">add a task</label>
                        <div className="space-1" />
                        <AsyncCreatable
                            styles={selectStyles}
                            isClearable
                            defaultOptions
                            loadOptions={loadEventCategories}
                            getOptionValue={(option) => option.label}
                            placeholder="Select a task..."
                            name="eventTask"
                            inputId="eventTask"
                            onChange={(selection: ValueType<Option>, action) => {
                                if (selection && "label" in selection) {
                                    switch (action.action) {
                                        case "select-option": {
                                            setSelectedTaskOption(selection);
                                            break;
                                        }
                                        case "create-option":
                                            // TODO create the thing
                                            break;
                                        default: {
                                            setSelectedTaskOption(undefined);
                                            break;
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                    <PrimaryButton>add task</PrimaryButton>
                </div>
            </form>
            {displayEventTasks()}
        </>
    );
};
