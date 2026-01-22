import { type RouteConfig } from "@react-router/dev/routes";
import siteRoutesConfig from "./site/site_routes_config";
import commonRoutesConfig from "./common/common_routes_config";
import cmsRouteConfig from "./cms/cms_routes_config";

export default [
    ...siteRoutesConfig,
    ...commonRoutesConfig,
    ...cmsRouteConfig
] satisfies RouteConfig;
