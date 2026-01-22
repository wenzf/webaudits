import { type RouteConfig,  route } from "@react-router/dev/routes";

const commonRoutesConfig = [
    route("actions/cu-settings", "./common/routes/actions_and_loaders/site_set_settings.tsx"),

]



export default commonRoutesConfig satisfies RouteConfig