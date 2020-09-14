import React from "react";
import "./Buttons.css";
import "./CriticalButton.css";
import "./LinkButton.css";
import "./PrimaryButton.css";
import "./SecondaryButton.css";
import "./MenuButton.css";
import "./CancelButton.css";

type ReactButtonProps = React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
>;

const makeButton = (
    buttonTypeClassName: string,
): React.ForwardRefExoticComponent<
    React.PropsWithoutRef<ReactButtonProps> & React.RefAttributes<HTMLButtonElement>
> =>
    // eslint-disable-next-line react/display-name
    React.forwardRef<HTMLButtonElement, ReactButtonProps>((props, ref) => {
        const providedClassName = props.className ? props.className : "";
        const className = `BaseButton ${buttonTypeClassName} ${providedClassName}`;
        return (
            <button {...props} ref={ref} className={className}>
                <div className="BaseButton-content">{props.children}</div>
            </button>
        );
    });

export const PrimaryButton = makeButton("PrimaryButton");
export const SecondaryButton = makeButton("SecondaryButton");
export const LinkButton = makeButton("LinkButton");
export const CriticalButton = makeButton("CriticalButton");
export const MenuButton = makeButton("MenuButton");
export const CancelButton = makeButton("CancelButton");
