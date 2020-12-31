import { StylesConfig } from "react-select";
import { Option } from "./api";

const textColor = "#858382";
const levelOneColor = "#141310";

export const colors = {
    "text-color": textColor,
    "non-essential-color": "#b9bdc5",
    "level-one-accent": "#301E17",
    "level-one-color": levelOneColor,
    "level-two-color": "#1D1712",
};

export const fonts = {
    "font-family-regular": "Roboto, Arial, sans-serif",
};

export const selectStyles: StylesConfig<Option, boolean> = {
    input: (base) => ({
        ...base,
        color: colors["text-color"],
    }),
    singleValue: (base) => ({
        ...base,
        color: colors["text-color"],
        fontFamily: fonts["font-family-regular"],
        textIndent: "8px",
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    placeholder: (base, state: any) => ({
        ...base,
        fontFamily: fonts["font-family-regular"],
        fontSize: "16px",
        color: state.isFocused ? colors["text-color"] : "#686a6e",
        opacity: "1",
        textIndent: "8px",
        textTransform: "initial",
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    option: (base, state: any) => ({
        ...base,
        backgroundColor: state.isFocused ? colors["level-one-accent"] : "transparent",
        "&:hover": {
            backgroundColor: colors["level-one-accent"],
        },
    }),
    control: (base) => ({
        ...base,
        backgroundColor: colors["level-one-color"],
        color: colors["text-color"],
        // match with the menu
        borderRadius: "3px",
        // Overwrites the different states of border
        borderColor: "#c3573e",
        // Removes weird border around container
        boxShadow: undefined,
        "&:hover": {
            // Overwrites the different states of border
            borderColor: "#c3573e",
        },
    }),
    menu: (base) => ({
        ...base,
        borderRadius: "3px",
        // kill the gap
        marginTop: 0,
        backgroundColor: colors["level-two-color"],
    }),
    menuList: (base) => ({
        ...base,
        // kill the white space on first and last option
        padding: 0,
        borderRadius: "3px",
    }),
};
