import React, { ReactElement } from "react";
import { Controller } from "react-hook-form";
import AsyncCreatable from "react-select/async-creatable";
import { selectStyles } from "../../Styles";
import { loadEventTypeSearchTerm, MAX_NAME_LENGTH, Option } from "../../api";
import { createEventType, EventActionTypes, EventTypeCacheReducerAction } from "./EventTypeApi";
import { Control } from "react-hook-form/dist/types/form";
import { createFilter } from "react-select";

interface EventTypeSelectProps {
    control: Control;
    dispatchToEventTypeCache: React.Dispatch<EventTypeCacheReducerAction>;
    selectedEventType?: Option;
    setSelectedEventType: React.Dispatch<React.SetStateAction<Option | undefined>>;
}

export const EventTypeSelect = ({
    control,
    dispatchToEventTypeCache,
    selectedEventType,
    setSelectedEventType,
}: EventTypeSelectProps): ReactElement => {
    const loadEventTypes = (searchTerm: string): Promise<Option[]> => {
        return loadEventTypeSearchTerm(searchTerm, dispatchToEventTypeCache);
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
                    dispatchToEventTypeCache({
                        type: EventActionTypes.LOAD,
                        eventTypes: [result],
                    });
                    setSelectedEventType({
                        value: result.eventTypeName,
                        label: result.displayName,
                    });
                })
                .catch((error) => {
                    console.error(`unable to create event type ${inputVal}: ${error.message}`);
                }))();
    };

    return (
        <Controller
            name="eventTypeOption"
            control={control}
            defaultValue={selectedEventType}
            render={({ field: { onChange } }): ReactElement => (
                <>
                    <label
                        data-testid="event-type-select"
                        htmlFor="event type"
                        style={{ textAlign: "initial" }}
                    >
                        event type
                    </label>
                    <div className={"space-1"} />
                    <AsyncCreatable
                        styles={selectStyles}
                        loadOptions={loadEventTypes}
                        defaultOptions
                        isClearable
                        placeholder="Select an Event Type..."
                        name="event type"
                        defaultValue={selectedEventType}
                        getOptionValue={(option) => option.label}
                        inputId="event type"
                        value={selectedEventType}
                        onCreateOption={createAndMapEventType}
                        onChange={(selection): void => {
                            const newValuesOrEmpty = (selection || undefined) as Option;
                            setSelectedEventType(newValuesOrEmpty);
                            onChange(selection);
                        }}
                        onInputChange={(i) => i.substr(0, MAX_NAME_LENGTH)}
                        filterOption={createFilter({
                            ignoreCase: true,
                            matchFrom: "any",
                        })}
                    />
                </>
            )}
        />
    );
};
