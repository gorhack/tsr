import React, { ReactElement } from "react";
import DatePicker from "react-datepicker";
import { Controller } from "react-hook-form";
import { Control } from "react-hook-form/dist/types/form";
import "react-datepicker/dist/react-datepicker.css";

interface FormDatePickerProps {
    control: Control;
    label: string;
    error?: string;
    name: string;
    minDate?: Date;
    maxDate?: Date;
    placeholder?: string;
}

export const FormDatePicker = (props: FormDatePickerProps): ReactElement => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            rules={{
                required: true,
            }}
            as={({ onChange, onBlur, value }) => {
                return (
                    <label className="Labeled-Input">
                        <span className={"space-1"}>{props.label}</span>
                        <DatePicker
                            minDate={props.minDate}
                            maxDate={props.maxDate}
                            placeholderText={props.placeholder}
                            onBlur={onBlur}
                            selected={value}
                            onChange={onChange}
                        />
                        {props.error && <div className="error-message">{props.error}</div>}
                    </label>
                );
            }}
        />
    );
};
FormDatePicker.displayName = "FormDatePicker";
