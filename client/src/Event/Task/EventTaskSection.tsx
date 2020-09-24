import React, { FormEvent, ReactElement, useEffect, useReducer, useState } from "react";
import AsyncCreatable from "react-select/async-creatable";
import { PrimaryButton } from "../../Buttons/Buttons";
import { selectStyles } from "../../Styles";
import { LONG_DATE_FORMAT, Option } from "../../api";
import {
    createEventTask,
    EventTask,
    EventTaskActionTypes,
    EventTaskCategory,
    EventTaskReducerAction,
    getEventTaskCategoriesContains,
    getEventTasks,
} from "./EventTaskApi";
import "../EventPage.css";
import { SocketSubscriptionTopics, TsrEvent } from "../EventApi";
import { ValueType } from "react-select";
import sortBy from "lodash/sortBy";
import { useStompSocketContext } from "../../StompSocketContext";
import { SocketStatus } from "../../SocketService";
import { IMessage } from "@stomp/stompjs";
import { DetailRow } from "../DetailRow";
import moment from "moment";

interface EventTaskSectionProps {
    tsrEvent: TsrEvent;
}

export const EventTaskSection = ({ tsrEvent }: EventTaskSectionProps): ReactElement => {
    const { socketService } = useStompSocketContext();
    const [selectedTaskOption, setSelectedTaskOption] = useState<Option | undefined>(undefined);
    const [eventTaskCache, setEventTaskCache] = useState<EventTaskCategory[]>([]);
    const [taskOpen, setTaskOpen] = useState<number | undefined>(undefined);
    const reducerInitialState: EventTask[] = [];
    const eventTaskReducer = (state: EventTask[], action: EventTaskReducerAction): EventTask[] => {
        switch (action.type) {
            case EventTaskActionTypes.LOAD: {
                return sortBy(action.eventTasks, (eventTask) => eventTask.status.sortOrder);
            }
            case EventTaskActionTypes.ADD: {
                return sortBy(
                    [...state, action.eventTask],
                    (eventTask) => eventTask.status.sortOrder,
                );
            }
            default:
                return [...state];
        }
    };
    const [eventTasks, eventTasksDispatch] = useReducer(eventTaskReducer, reducerInitialState);

    useEffect(() => {
        if (socketService.status !== SocketStatus.CONNECTED) {
            return;
        }
        socketService.subscribe({
            topic: `${SocketSubscriptionTopics.TASK_CREATED}${tsrEvent.eventId}`,
            handler: (msg: IMessage): void => {
                const message: EventTask = JSON.parse(msg.body);
                eventTasksDispatch({
                    type: EventTaskActionTypes.ADD,
                    eventTask: message,
                });
            },
        });
    }, [socketService, tsrEvent.eventId]);

    useEffect(() => {
        (async () => {
            await getEventTasks(tsrEvent.eventId)
                .then((response) => {
                    eventTasksDispatch({
                        type: EventTaskActionTypes.LOAD,
                        eventTasks: response,
                    });
                })
                .catch((error) => {
                    console.error(`could not get event tasks ${error.message}`);
                });
        })();
    }, [tsrEvent.eventId]);

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
        try {
            await createEventTask(tsrEvent.eventId, foundEventTask);
        } catch (error) {
            console.error(`could not add event task ${error.message}`);
        }
        setSelectedTaskOption(undefined); // TODO: clear the value in the select
    };

    const displayEventTasks = (): JSX.Element => {
        return (
            <>
                {eventTasks.map((eventTask) => {
                    const open = taskOpen === eventTask.eventTaskId;
                    const openHandler = (): void => {
                        setTaskOpen(eventTask.eventTaskId);
                    };
                    const closeHandler = (): void => {
                        setTaskOpen(undefined);
                    };
                    return (
                        <div key={`task-container-${eventTask.eventTaskId}`}>
                            <button
                                type="button"
                                className={`Event-Task-Collapsible ${
                                    taskOpen === eventTask.eventTaskId ? "active" : ""
                                }`}
                                onClick={open ? closeHandler : openHandler}
                                key={`task-header-${eventTask.eventTaskId}`}
                                data-testid={`task-${eventTask.eventTaskCategory.eventTaskId}`}
                            >
                                {eventTask.eventTaskCategory.eventTaskDisplayName}
                            </button>
                            {open && (
                                <div
                                    className="Event-Task-Details"
                                    key={`task-body-${eventTask.eventTaskId}`}
                                >
                                    <DetailRow
                                        label="suspense date"
                                        description={moment
                                            .utc(eventTask.suspenseDate)
                                            .local()
                                            .format(LONG_DATE_FORMAT)}
                                    />
                                    <DetailRow
                                        label="approver"
                                        description={eventTask.approver.username}
                                    />
                                    <DetailRow
                                        label="resourcer"
                                        description={eventTask.resourcer.username}
                                    />
                                </div>
                            )}
                        </div>
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
            <div className="space-3" />
            {displayEventTasks()}
        </>
    );
};
