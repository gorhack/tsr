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
            control={props.control}
            name={props.name}
            defaultValue=""
            rules={{
                required: true,
            }}
            render={({ onChange, value }): ReactElement => {
                return (
                    <>
                        <label className="Labeled-Input" htmlFor={props.name}>
                            {props.label}
                        </label>
                        <div className={"space-1"} />
                        <DatePicker
                            id={props.name}
                            startDate={props.minDate}
                            minDate={props.minDate}
                            maxDate={props.maxDate}
                            placeholderText={props.placeholder}
                            onChange={(val) => onChange(val)}
                            selected={value}
                            value={value}
                        />
                        {props.error && <div className="error-message">{props.error}</div>}
                    </>
                );
            }}
        />
    );
};
FormDatePicker.displayName = "FormDatePicker";
