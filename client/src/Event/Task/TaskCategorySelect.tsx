import React, { ReactElement } from "react";
import { selectStyles } from "../../Styles";
import { ValueType } from "react-select";
import { loadTaskCategorySearchTerm, Option } from "../../api";
import AsyncCreatable from "react-select/async-creatable";
import {
    createEventTaskCategory,
    EventTaskCategoryActionTypes,
    EventTaskCategoryCacheReducerAction,
} from "./EventTaskApi";

interface TaskCategorySelect {
    dispatchToEventTaskCategoryCache: React.Dispatch<EventTaskCategoryCacheReducerAction>;
    isMulti: boolean;
    selectedTaskOptions: Option[];
    setSelectedTaskOptions: React.Dispatch<React.SetStateAction<Option[]>>;
}

export const TaskCategorySelect = ({
    dispatchToEventTaskCategoryCache,
    isMulti,
    selectedTaskOptions,
    setSelectedTaskOptions,
}: TaskCategorySelect): ReactElement => {
    const loadEventCategories = (searchTerm: string): Promise<Option[]> => {
        return loadTaskCategorySearchTerm(searchTerm, dispatchToEventTaskCategoryCache);
    };

    const createAndMapEventTaskCategory = (inputVal: string): void => {
        (async () =>
            createEventTaskCategory({
                eventTaskCategoryId: 0,
                eventTaskDisplayName: inputVal,
                eventTaskName: inputVal,
            })
                .then((result) => {
                    dispatchToEventTaskCategoryCache({
                        type: EventTaskCategoryActionTypes.LOAD,
                        eventTaskCategories: [result],
                    });
                    setSelectedTaskOptions([
                        ...selectedTaskOptions,
                        { value: result.eventTaskDisplayName, label: result.eventTaskDisplayName },
                    ]);
                })
                .catch((error) => {
                    console.error(`unable to create task category ${inputVal} ${error.message}`);
                }))();
    };

    return (
        <AsyncCreatable
            styles={selectStyles}
            isClearable
            isMulti={isMulti}
            defaultOptions
            loadOptions={loadEventCategories}
            getOptionValue={(option) => option.label}
            placeholder="Select a task..."
            name="eventTask"
            inputId="eventTask"
            value={selectedTaskOptions}
            onCreateOption={createAndMapEventTaskCategory}
            onChange={(selection: ValueType<Option>, action) => {
                if (selection && "label" in selection) {
                    switch (action.action) {
                        case "select-option": {
                            setSelectedTaskOptions([selection]);
                            break;
                        }
                        default: {
                            setSelectedTaskOptions([]);
                            break;
                        }
                    }
                }
            }}
        />
    );
};
