import React, {ReactElement} from "react";
import DatePicker from "react-datepicker";
import {Controller} from "react-hook-form";
import {Control} from "react-hook-form/dist/types/form";
import "react-datepicker/dist/react-datepicker.css";

interface FormDatePickerProps {
    control: Control;
    label: string;
    error?: string;
    inputProps?: React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
        >;
}

export const FormDatePicker = (props:FormDatePickerProps):ReactElement =>{
    const validate = (e: any) => {
        console.log(e.target.value)
    }
    return <Controller
        onBlur={validate}
        control={props.control}
        name={props.inputProps?.name||"DatePicker"}
        render={({ onChange, onBlur, value })=>{
            return <DatePicker
                startDate={new Date()}
                endDate={new Date(new Date().setFullYear(new Date().getFullYear()+5))}
                placeholderText={props.inputProps?.placeholder}
                onChange={onChange}
                onBlur={onBlur}
                selected={value}
            />
        }}
    />
}