import React from "react";

interface DrawerCloseIconProps {
    className?: string;
}
export const DrawerCloseIcon = React.memo(({ className }: DrawerCloseIconProps) => {
    return (
        <svg
            width="7"
            height="13"
            viewBox="0 0 7 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path d="M0.223946 6.08414L5.6747 0.501579C5.99182 0.196825 6.47746 0.196825 6.77605 0.501579C7.07465 0.806334 7.07465 1.3209 6.77605 1.62565L1.86649 6.63651L6.77605 11.6474C7.07465 11.971 7.07465 12.4667 6.77605 12.7714C6.47746 13.0762 5.9918 13.0762 5.6747 12.7714L0.223946 7.20822C-0.0746484 6.88456 -0.0746484 6.3889 0.223946 6.08414Z" />
        </svg>
    );
});
DrawerCloseIcon.displayName = "DrawerCloseIcon";
