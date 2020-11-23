import "@testing-library/jest-dom";
import axios from "axios";

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires */
(global as any).td = require("testdouble");
require("testdouble-jest")((global as any).td, jest);
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires */

if (typeof TextEncoder !== "function") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const TextEncodingPolyfill = require("text-encoding");
    Object.assign(global, {
        TextEncoder: TextEncodingPolyfill.TextEncoder,
        TextDecoder: TextEncodingPolyfill.TextDecoder,
    });
}

// https://www.npmjs.com/package/nock#axios
axios.defaults.adapter = require("axios/lib/adapters/http");

// Helps track down unhandled promise rejections
process.on("unhandledRejection", (reason, p) => {
    console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
});

/* eslint-disable @typescript-eslint/no-explicit-any */
window.location.reload = (global as any).td.func();
window.scrollTo = (global as any).td.func();
HTMLElement.prototype.scrollIntoView = (global as any).td.func();
window.confirm = (global as any).td.func();
/* eslint-enable @typescript-eslint/no-explicit-any */

// userEvent.type
document.createRange = () => ({
    setStart: jest.fn(),
    setEnd: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    commonAncestorContainer: {
        nodeName: "BODY",
        ownerDocument: document,
    },
});
jest.mock("popper.js", () => {
    const PopperJS = jest.requireActual("popper.js");

    return class {
        static placements = PopperJS.placements;

        constructor() {
            return {
                destroy: jest.fn(),
                scheduleUpdate: jest.fn(),
            };
        }
    };
});
