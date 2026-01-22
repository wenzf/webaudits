const plugin = require("tailwindcss/plugin");


/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{tsx,ts, css}",
        // ... other files
    ],
    safelist: [
        "lg:whitespace-nowrap", "md:text-xl", "z-[5]", "max-w-xl", "lg:gap-16",
        "lg:w-2xl", "sm:min-w-md", "lg:grid-cols-1", "[&_a]:rounded-xl",
        "[&_a]:flex", "[&_a]:flex-col", "lg:justify-between", "lg:border-l",
        "border-l-neutral-500", "lg:self-end", "h-screen", "z-50", "fixed",
        "left-0", "top-0", "overflow-y-auto", "overflow-x-hidden", "pb-12",
        "border-r", "border-r-neutral-200", "dark:border-r-neutral-800", "w-12",
        "lg:flex-row", "top-2/4", "transform", "-translate-y-2/4", "transform",
        "transition-transform", "duration-100", "ease-linear", "text-sm", "text-left",
        "opacity-0", "translate-x-2", "w-0", "lg:fixed", "lg:top-2", "left-14",
        "sm:w-64", "mt-12", "max-w-[calc(100vw_-_17rem)]", "overflow-y-hidden",
        "overflow-hidden", "z-[122]", "h-8", "p-[5px]", "pl-6", "pr-4", "gap-7",
        "px-4", "pb-12", "max-w-[calc(100vw_-_4rem)]", "max-w-5xl"
    ]

};
