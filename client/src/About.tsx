import React, { ReactElement } from "react";
import "./About.css";
import TrackedLogoBold from "./Icons/TrackedLogoBold.svg";

export const About: React.FC = (): ReactElement => {
    return (
        <>
            <h1>about TSR</h1>
            <div className="About-content">
                <img src={TrackedLogoBold} alt="" height="200px" />
                <div className="space-4" />
                <span>
                    TSR is an open source project created by Rangers in 2nd Battalion, 75th Ranger
                    Regiment. This project is designed to solve immediate problems within 2/75 when
                    it comes to how we resource and plan training.
                </span>
                <div className="space-2" />
                <a rel="noopener noreferrer" href="https://github.com/gorhack/tsr" target="_blank">
                    Contribute Open Source
                </a>
            </div>
        </>
    );
};
About.displayName = "About";
