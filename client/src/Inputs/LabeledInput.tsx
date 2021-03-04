import clsx from "clsx";
import React, { ReactElement } from "react";
import { MAX_NAME_LENGTH } from "../api";

interface LabeledInputProps {
    label: string;
    error?: string;
    hint?: string;
    tooltip?: string;
    onChange?: () => void;
    inputProps?: React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
    >;
}

export const LabeledInput = (props: LabeledInputProps): ReactElement => {
    const { label, error, hint, tooltip, inputProps, onChange } = props;
    const inputClassName = inputProps && inputProps.className;
    const finalClass = clsx(inputClassName, { error: error });
    return (
        <label className="Labeled-Input" htmlFor={label}>
            <div className={"space-1"} />
            {label}
            <input
                name={label}
                className={finalClass}
                aria-label={label}
                onChange={onChange}
                type="text"
                maxLength={MAX_NAME_LENGTH}
                {...inputProps}
            />
            {hint && <div className="hint-message">{hint}</div>}
            {tooltip && <div className="tooltip-message">{tooltip}</div>}
            {error && <div className="error-message">{error}</div>}
        </label>
    );
};
