import type { HTMLProps } from "react"

const appTypes = [
    ["Game Application", "GameApplication"],
    ["Social NetworkingApplication", "SocialNetworkingApplication"],
    ["Travel Application", "TravelApplication"],
    ["Shopping Application", "ShoppingApplication"],
    ["Sports Application", "SportsApplication"],
    ["Lifestyle Application", "LifestyleApplication"],
    ["Business Application", "BusinessApplication"],
    ["Design Application", "DesignApplication"],
    ["Developer Application", "DeveloperApplication"],
    ["Driver Application", "DriverApplication"],
    ["Educational Application", "EducationalApplication"],
    ["Health Application", "HealthApplication"],
    ["Finance Application", "FinanceApplication"],
    ["Security Application", "SecurityApplication"],
    ["Browser Application", "BrowserApplication"],
    ["Communication Application", "CommunicationApplication"],
    ["Desktop Enhancement Application", "DesktopEnhancementApplication"],
    ["Entertainment Application", "EntertainmentApplication"],
    ["Multimedia Application", "MultimediaApplication"],
    ["Home Application", "HomeApplication"],
    ["Utilities Application", "UtilitiesApplication"],
    ["Reference Application", "ReferenceApplication"],
]




export type FormConf = {
    id: string,
    label?: string
    element_type: "input" | "section"
    input_type?: "text" | "number" | "custom_select" | "hidden" | "date" | "textarea"
    defaultValue?: string | number
    dataNamespaces?: string[],
    note?: string
    input_props?: HTMLProps<HTMLInputElement | HTMLTextAreaElement>
    options?: any
}

export const softwareApplicationformStructure: FormConf[] = [
    {
        id: "st1",
        element_type: "input",
        input_type: "hidden",
        defaultValue: "SoftwareApplication",
        dataNamespaces: ['@type', 'review.itemReviewed.@type'],
        input_props: { required: true }
    },
    {
        id: "st2",
        element_type: "input",
        input_type: "hidden",
        defaultValue: "Organization",
        dataNamespaces: ['creator.@type'],
        input_props: { required: true }
    },
    {
        id: "st3",
        input_type: "hidden",
        element_type: "input",
        defaultValue: "https://www.vrfx.ch/#identity",
        dataNamespaces: ['creator.@id'],
        input_props: { required: true }
    },
    {
        id: "st4",
        input_type: "hidden",
        element_type: "input",
        defaultValue: "https://www.vrfx.ch/licensing",
        dataNamespaces: ['license'],
        input_props: { required: true }
    },
    {
        id: "se1",
        element_type: "section",
        label: "Application"
    },
    {
        id: "se1a",
        element_type: "input",
        input_type: "text",
        label: "Name",
        defaultValue: "",
        dataNamespaces: ['name'],
        // required: true,
        input_props: { required: true }
    },
    {
        id: "c",
        element_type: "input",
        input_type: "text",
        label: "Description",
        defaultValue: "",
        dataNamespaces: ['description']
    },
    {
        id: "d",
        element_type: "input",
        input_type: "text",
        label: "operatingSystem",
        defaultValue: "",
        dataNamespaces: ['operatingSystem'],
        input_props: { required: true }
    },
    {
        id: "e",
        element_type: "input",
        input_type: "custom_select",
        label: "Application Category",
        defaultValue: "",
        dataNamespaces: ['applicationCategory'],
        input_props: { required: true },
        options: { selectItems: appTypes }
    },
    {
        id: "f",
        element_type: "input",
        input_type: "text",
        label: "URL",
        defaultValue: "",
        dataNamespaces: ['url', '@id', 'review.itemReviewed.@id'],
        input_props: { required: true },
        note: "URL of application / URL of portfolio case page"
    },
    {
        id: "g",
        element_type: "input",
        input_type: "text",
        label: "Screenshot URL",
        defaultValue: "",
        dataNamespaces: ['screenshot'],
        input_props: {},
        note: "png / jpg URL"
    },
    {
        id: "se2",
        element_type: "section",
        label: "Review"
    },
    {
        id: "hi_1",
        element_type: "input",
        input_type: "hidden",
        defaultValue: "Offer",
        dataNamespaces: ['offers.@type'],
        input_props: { required: true },
    },
    {
        id: "hi_2",
        element_type: "input",
        input_type: "hidden",
        defaultValue: 0,
        dataNamespaces: ['offers.price'],
        input_props: { required: true },
    },
    {
        id: "hi_3",
        element_type: "input",
        input_type: "hidden",
        defaultValue: "CHF",
        dataNamespaces: ['offers.priceCurrency'],
        input_props: { required: true },
    },
    {
        id: "hi_rhx",
        element_type: "input",
        input_type: "hidden",
        defaultValue: "Review",
        dataNamespaces: ['review.@type'],
        input_props: { required: true },
    },
    {
        id: "hi_riz",
        element_type: "input",
        input_type: "hidden",
        defaultValue: "Rating",
        dataNamespaces: ['review.reviewRating.@type'],
        input_props: { required: true },
    },
    {
        id: "hi_rj",
        element_type: "input",
        input_type: "hidden",
        defaultValue: "5",
        dataNamespaces: ['review.reviewRating.ratingValue'],
        input_props: { required: true },
    },
    {
        id: "hi_rk",
        element_type: "input",
        input_type: "hidden",
        defaultValue: "5",
        dataNamespaces: ['review.reviewRating.bestRating'],
        input_props: { required: true },
    },
    {
        id: "hi_rl",
        element_type: "input",
        input_type: "hidden",
        defaultValue: "Organization",
        dataNamespaces: ['review.author.@type'],
        input_props: { required: true },
    },
    {
        id: "hi_rm",
        element_type: "input",
        input_type: "hidden",
        defaultValue: "https://www.vrfx.ch/#identity",
        dataNamespaces: ['review.author.@id'],
        input_props: { required: true },
    },
    {
        id: "h1_x1",
        element_type: "input",
        input_type: "date",
        label: "Date published",
        defaultValue: "",
        dataNamespaces: ['review.datePublished'],
        input_props: { required: true }
    }, {
        id: "hi_x2",
        element_type: "input",
        input_type: "textarea",
        label: "Review Body",
        defaultValue: "",
        dataNamespaces: ['review.reviewBody'],
        input_props: { required: true, rows: 4 }
    },
    {
        id: "hi_rg",
        element_type: "input",
        input_type: "hidden",
        defaultValue: "AggregateRating",
        dataNamespaces: ['aggregateRating.@type'],
        input_props: { required: true },
    },
    {
        id: "hi_rh",
        element_type: "input",
        input_type: "hidden",
        defaultValue: 5,
        dataNamespaces: ['aggregateRating.ratingValue'],
        input_props: { required: true },
    },
    {
        id: "hi_ri",
        element_type: "input",
        input_type: "hidden",
        defaultValue: 1,
        dataNamespaces: ['aggregateRating.ratingCount'],
        input_props: { required: true },
    },
]
