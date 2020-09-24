import React, { ReactElement } from "react";
import "./DetailRow.css";

export interface DetailRowProps {
    label: string;
    description: string;
    className?: string;
}

export const DetailRow = ({ label, description, className = "" }: DetailRowProps): ReactElement => {
    return (
        <div className={`Detail-Row ${className}`}>
            <span className={"Detail-Row-Label"}>{label}</span>
            <span aria-label={label}>{description}</span>
        </div>
    );
};
