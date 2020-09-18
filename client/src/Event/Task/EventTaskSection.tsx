import React, { ReactElement } from "react";
import AsyncCreatable from "react-select/async-creatable";
import { PrimaryButton } from "../../Buttons/Buttons";
import { selectStyles } from "../../Styles";
import { Option } from "../../api";
import { getEventTaskCategoriesContains } from "./EventTaskApi";
import "../EventPage.css";

export const EventTaskSection = (): ReactElement => {
    const loadEventCategories = async (searchTerm: string): Promise<Option[]> => {
        return getEventTaskCategoriesContains(searchTerm).then((result) => {
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

    return (
        <>
            <h2>Event Requirements</h2>
            <div className="space-3" />
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
                    />
                </div>
                <PrimaryButton>add task</PrimaryButton>
            </div>
        </>
    );
};
