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

export const FormDatePicker = ({
    control,
    label,
    error,
    name,
    minDate,
    maxDate,
    placeholder,
}: FormDatePickerProps): ReactElement => {
    return (
        <Controller
            control={control}
            name={name}
            defaultValue=""
            rules={{
                required: true,
            }}
            render={({ field: { onChange, value } }): ReactElement => {
                return (
                    <>
                        <label className="Labeled-Input" htmlFor={name}>
                            {label}
                        </label>
                        <div className={"space-1"} />
                        <DatePicker
                            id={name}
                            startDate={minDate}
                            minDate={minDate}
                            maxDate={maxDate}
                            placeholderText={placeholder}
                            onChange={onChange}
                            selected={value}
                        />
                        {error && <div className="error-message">{error}</div>}
                    </>
                );
            }}
        />
    );
};

FormDatePicker.displayName = "FormDatePicker";
