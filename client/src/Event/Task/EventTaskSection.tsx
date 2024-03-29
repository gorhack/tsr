import React, {
    ChangeEvent,
    FormEvent,
    ReactElement,
    useEffect,
    useReducer,
    useState,
} from "react";
import { MenuButton, PrimaryButton } from "../../Buttons/Buttons";
import { LONG_DATE_FORMAT, Option } from "../../api";
import {
    addComment,
    createEventTask,
    EventTask,
    EventTaskActionTypes,
    EventTaskCategory,
    EventTaskCategoryActionTypes,
    EventTaskCategoryCacheReducerAction,
    EventTaskComment,
    EventTaskReducerAction,
    getEventTasks,
} from "./EventTaskApi";
import "../EventPage.css";
import { SocketSubscriptionTopics, TsrEvent } from "../EventApi";
import sortBy from "lodash/sortBy";
import { useStompSocketContext } from "../../StompSocketContext";
import { SocketStatus } from "../../SocketService";
import { IMessage } from "@stomp/stompjs";
import { DetailRow } from "../DetailRow";
import moment from "moment";
import { TaskCategorySelect } from "./TaskCategorySelect";
import { sortedUniqBy } from "lodash";

interface EventTaskSectionProps {
    tsrEvent: TsrEvent;
}

const eventTaskReducer = (state: EventTask[], action: EventTaskReducerAction): EventTask[] => {
    switch (action.type) {
        case EventTaskActionTypes.LOAD: {
            return sortBy(action.eventTasks, (eventTask) => eventTask.status.sortOrder);
        }
        case EventTaskActionTypes.ADD: {
            return sortBy([...state, action.eventTask], (eventTask) => eventTask.status.sortOrder);
        }
        case EventTaskActionTypes.ADD_COMMENT: {
            return state.map((eventTask) =>
                eventTask.eventTaskId === action.comment.eventTaskId
                    ? { ...eventTask, comments: [...eventTask.comments, action.comment] }
                    : eventTask,
            );
        }
        default:
            return state;
    }
};

const eventTaskCategoryReducer = (
    state: EventTaskCategory[],
    action: EventTaskCategoryCacheReducerAction,
): EventTaskCategory[] => {
    if (action.type === EventTaskCategoryActionTypes.LOAD) {
        return sortedUniqBy<EventTaskCategory>(
            [...state, ...action.eventTaskCategories],
            (e) => e.eventTaskCategoryId,
        );
    } else {
        return state;
    }
};

export const EventTaskSection = ({ tsrEvent }: EventTaskSectionProps): ReactElement => {
    const { socketService } = useStompSocketContext();
    const [selectedTaskOption, setSelectedTaskOption] = useState<Option[]>([]);
    const [eventTaskCache, eventTaskCacheDispatch] = useReducer(eventTaskCategoryReducer, []);
    const [taskOpen, setTaskOpen] = useState<number | undefined>(undefined);
    const reducerInitialState: EventTask[] = [];
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
        socketService.subscribe({
            topic: `${SocketSubscriptionTopics.TASK_COMMENT_CREATED}${tsrEvent.eventId}`,
            handler: (msg: IMessage): void => {
                const message: EventTaskComment = JSON.parse(msg.body);
                eventTasksDispatch({
                    type: EventTaskActionTypes.ADD_COMMENT,
                    comment: message,
                });
            },
        });
        return () => {
            const newTaskSubId = socketService.findSubscriptionWithoutError(
                `${SocketSubscriptionTopics.TASK_CREATED}${tsrEvent.eventId}`,
            )?.subscription.id;
            if (newTaskSubId) {
                socketService.unsubscribe(newTaskSubId);
            }
            const newCommentSubId = socketService.findSubscriptionWithoutError(
                `${SocketSubscriptionTopics.TASK_CREATED}${tsrEvent.eventId}`,
            )?.subscription.id;
            if (newCommentSubId) {
                socketService.unsubscribe(newCommentSubId);
            }
        };
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

    const addEventTask = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        let foundEventTasks: EventTaskCategory[] = [];
        selectedTaskOption.forEach((eventTaskCategoryOption): void => {
            const foundEventTask = eventTaskCache.find((eventTask) => {
                if (eventTask.eventTaskDisplayName === eventTaskCategoryOption.label) {
                    return eventTask;
                }
                return undefined;
            });
            if (foundEventTask) {
                foundEventTasks = [...foundEventTasks, foundEventTask];
            }
        });
        for (const eventTask of foundEventTasks) {
            try {
                await createEventTask(tsrEvent.eventId, eventTask);
            } catch ({ message }) {
                console.error(`could not add event task ${message as string}`);
            }
        }
        setSelectedTaskOption([]); // TODO: clear the value in the select
    };

    const displayComments = (comments: EventTaskComment[]): ReactElement[] => {
        return comments.map((comment) => {
            return (
                <div key={`task-comment-${comment.commentId}`}>
                    <span>{comment.audit && comment.audit.createdByDisplayName + ":"}</span>
                    <span
                        aria-label={comment.audit && comment.audit.createdByDisplayName}
                        style={{ paddingLeft: "1rem" }}
                    >
                        {comment.annotation}
                    </span>
                    <div className={"space-1"} />
                </div>
            );
        });
    };

    const [commentAnnotation, setCommentAnnotation] = useState<string>("");

    const submitComment = (e: FormEvent<HTMLFormElement>, eventTask: EventTask): void => {
        e.preventDefault();
        (async () => {
            try {
                await addComment(eventTask.eventId, {
                    eventTaskId: eventTask.eventTaskId,
                    annotation: commentAnnotation,
                });
            } catch ({ message }) {
                console.error(`unable to add your comment, ${message as string}`);
            }
        })();
        setCommentAnnotation("");
    };

    const handleCommentChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        setCommentAnnotation(e.target.value);
    };

    const displayCommentForm = (eventTask: EventTask): ReactElement => {
        return (
            <form title="commentForm" onSubmit={(e) => submitComment(e, eventTask)}>
                <textarea
                    className={"Event-Task-Comment"}
                    placeholder="Add a comment..."
                    onChange={handleCommentChange}
                    value={commentAnnotation}
                />
                <MenuButton>post comment</MenuButton>
            </form>
        );
    };

    const displayEventTasks = (): ReactElement => {
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
                                data-testid={`task-${eventTask.eventTaskCategory.eventTaskCategoryId}`}
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
                                    <div className={"space-2"} />
                                    {displayComments(eventTask.comments)}
                                    {displayCommentForm(eventTask)}
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
                <div className="flex-row-wrap Event-Detail-Add-Task">
                    <div className="EventPage-AddTask">
                        <label htmlFor="eventTask">add tasks</label>
                        <div className="space-1" />
                        <TaskCategorySelect
                            dispatchToEventTaskCategoryCache={eventTaskCacheDispatch}
                            selectedTaskOptions={selectedTaskOption}
                            setSelectedTaskOptions={setSelectedTaskOption}
                        />
                    </div>
                    <PrimaryButton>add tasks</PrimaryButton>
                </div>
            </form>
            <div className="space-3" />
            {displayEventTasks()}
        </>
    );
};
