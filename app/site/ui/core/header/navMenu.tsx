import { useReducer } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { CaretDownIcon, Cross2Icon, DotsVerticalIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { Link, NavLink, useFetcher, useNavigate, useParams, useRouteLoaderData } from "react-router";

import { useCurrentURL } from "~/common/shared/hooks";
import { createLangPathByParam, langByParam, langSwitcher } from "~/common/shared/lang";
import SITE_CONFIG from "~/site/site.config";
import Logo2 from "~/site/icons/Logo2";
import { localizedPath } from "~/common/shared/lang";


const fallbacklocs = {
	"sec_general": {
		"trigger_label": "Projekt",
		"home": {
			"title": "Web Audits",
			"description": "Für ein effizientes, nachhaltiges, offenes und sicheres Web"
		},
		"about": {
			"title": "Über das Projekt",
			"description": "Das Web besser machen"
		},
		"docs": {
			"title": "Dokumentation",
			"description": "Berechnung des ECOS Audits und technische Umsetzung"
		},
		"audits": {
			"title": "ECOS Audits",
			"description": "Audit von Webseiten als Startpunkt für Optimierungen"
		}
	},
	"sec_settings": {
		"trigger_label": "Einstellungen",
		"sec_title": "Einstellungen",
		"language": "Sprache",
		"theme": {
			"title": "Erscheinung",
			"b_system": "System",
			"b_light": "hell",
			"b_dark": "dunkel"
		},
		"font_size": {
			"title": "Schriftgrösse",
			"b_reset": "zurücksetzen"
		},
		"grayscale": {
			"title": "Farben",
			"b_colors": "normal",
			"b_gray": "grau"
		},
		"contrast": {
			"title": "Kontrast",
			"regular": "normal",
			"high_contrast": "hoch"
		}
	}
}

export default function NavMenu() {
	const { SITE_LANGS } = SITE_CONFIG
	const { settings } = useRouteLoaderData('root')
	const layoutLoaderData = useRouteLoaderData('site/routes/layouts/site_layout')
	const settingsFetchter = useFetcher({ key: 'settingsFetcher' })
	const currentURL = useCurrentURL()
	const { lang } = useParams()
	const navigate = useNavigate()
	const { lang_code } = langByParam(lang)

	const {
		sec_general, sec_settings
	} = layoutLoaderData.locTxt.nav_menu ?? fallbacklocs

	const [{
		theme,
		isOpen,
		font_size,
		ui_grayscale,
		ui_high_contrast
	}, dispatch] = useReducer(((st, act) => {
		return {
			...st,
			...act.reduce((
				i: Record<string, unknown>,
				j: Record<string, unknown>
			) => ({ ...i, ...j }), {})
		}
	}), {
		font_size: settings.font_size,
		theme: settings.theme,
		isOpen: false,
		ui_grayscale: settings.ui_grayscale,
		ui_high_contrast: settings.ui_high_contrast
	})


	const onChangeSettings = (key: string, value: string | number | boolean) => {
		if (typeof document === "object") {
			const doc = document.documentElement
			const body = document.body
			let additionalValue = {}
			if (key === "theme") {
				if (doc.classList.contains(theme)) doc.classList.replace(theme, value as string)
				// override @scalar/api-reference-react theming
				if (body.classList.contains(`${theme}-mode`)) {
					body.classList.remove(`${theme}-mode`)
				}
			} else if (key === "font_size") {
				doc.style.fontSize = `${value}%`
			} else if (key === "ui_high_contrast") {
				if (value) {
					doc.classList.add('contrast')
				} else {
					doc.classList.remove('contrast')
				}
			} else if (key === "ui_grayscale") {
				if (value) {
					doc.classList.add('grayscale')
				} else {
					doc.classList.remove('grayscale')
				}
			}

			dispatch([{ ...additionalValue, [key]: value }])

			settingsFetchter.submit({
				payload: JSON.stringify({ ...additionalValue, [key]: value }),
				redirect_to: currentURL
			}, {
				method: "post",
				action: "/actions/cu-settings",
				encType: "application/x-www-form-urlencoded",
				preventScrollReset: true
			})
		}
	}


	return (
		<div className="relative flex justify-end  w-full sm:w-auto">
			<NavigationMenu.Root className="relative z-10 flex justify-end w-full sm:w-auto">
				<NavigationMenu.List

					className="sm:w-[500px] flex justify-end m-0 flex list-none rounded-md md:pt-1 gap-1 mr-1">
					<NavigationMenu.Item>
						<NavigationMenu.Trigger
							className="group b_x flex select-none items-center justify-between gap-0.5 rounded px-3 py-2 text-base outline-none hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:ring ring-neutral-700 dark:ring-neutral-300">
							{sec_general.trigger_label}
							<CaretDownIcon
								width={18}
								height={18}
								className="relative  text-neutral-800 dark:text-neutral-200 transition-transform duration-[250] ease-in group-data-[state=open]:hidden sm:group-data-[state=open]:block sm:group-data-[state=open]:-rotate-180"
								aria-hidden
							/>
							<Cross2Icon
								width={18}
								height={18}
								aria-hidden
								className="hidden group-data-[state=open]:block sm:group-data-[state=open]:hidden"
							/>
						</NavigationMenu.Trigger>

						<NavigationMenu.Content className="NavigationMenuContent">

							<ul className="one m-0 grid list-none gap-x-2.5 p-5 sm:w-[500px] sm:grid-cols-[0.75fr_1fr]">
								<li className="row-span-3 grid">
									<NavigationMenu.Link asChild>
										<NavLink
											viewTransition
											className="border_squircle contrast_clear_opposite active flex h-full w-full select-none flex-col justify-center rounded-md bg-neutral-900/80 dark:bg-neutral-100/80 hover:bg-neutral-900 dark:hover:bg-neutral-100 p-[25px] outline-none focus:shadow-neutral-700 dark:focus:bg-neutral-300"
											to={createLangPathByParam(lang, '/')}
										>
											<Logo2
												width={111}
												height={111}
												aria-hidden
												className="text-neutral-100 dark:text-neutral-900 w-full"
											/>
											<div className="mb-[7px] text-center mt-4 text-[18px] font-medium leading-[1.2] text-white dark:text-black">
												{sec_general.home.title}
											</div>
											<p className="text-base text-center mt-2 leading-tight text-neutral-100 dark:text-neutral-900 justify-center">
												{sec_general.home.description}
											</p>
										</NavLink>
									</NavigationMenu.Link>
								</li>
								<NavListItem
									title={sec_general.audits.title}
									description={sec_general.audits.description}
									urlOrPath={localizedPath(lang, "NS_AUDITS")}
									type="internal"
								/>
								<NavListItem
									title={sec_general.docs.title}
									description={sec_general.docs.description}
									urlOrPath={localizedPath(lang, "NS_DOCS")}
									type="internal"
								/>
								<NavListItem
									title={sec_general.about.title}
									description={sec_general.about.description}
									urlOrPath={localizedPath(lang, "NS_ABOUT")}
									type="internal"
								/>
							</ul>
						</NavigationMenu.Content>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<NavigationMenu.Link
							className="h-full b_x flex select-none items-center justify-between gap-0.5 rounded px-3 py-2 outline-none hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:ring ring-neutral-700 dark:ring-neutral-300"
							href="https://github.com/wenzf/webaudits"
							rel="noopener noreferrer"
							target="_blank"
						>
							<GitHubLogoIcon width={18} height={18} aria-label="GitHub" />
						</NavigationMenu.Link>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<NavigationMenu.Trigger className="group h-full flex select-none items-center justify-between gap-0.5 rounded px-3 py-2 outline-none hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:ring ring-neutral-700 dark:ring-neutral-300">
							<DotsVerticalIcon width={18} height={18}
								aria-label={sec_settings.trigger_label}
								className="group-data-[state=open]:hidden sm:group-data-[state=open]:block"
							/>
							<Cross2Icon
								width={18}
								height={18}
								aria-hidden
								className="hidden group-data-[state=open]:block sm:group-data-[state=open]:hidden"
							/>
						</NavigationMenu.Trigger>
						<NavigationMenu.Content className="NavigationMenuContent">
							<div className="p-5 two m-0 grid list-none gap-x-2.5 p-5 max-w-[500px] sm:w-[500px] sm:grid-cols-[0.75fr_1fr]">
								<div className="mb-4 pt-4 font-medium leading-[1.2] text-[18px]">
									{sec_settings.sec_title}
								</div>
								<ul className="m-0 list-none w-full [&_li]:flex [&_li]:flex-col [&_li]:gap-4 [&_li]:justify-between [&_li]:px-4 [&_li]:py-2 [&_li]:mb-4 [&_button]:flex [&_button]:grow [&_button]:justify-center [&_button]:items-center">
									<li>
										<span>
											{sec_settings.language}
										</span>
										<div className='flex gap-4'>
											{SITE_LANGS.map((it) => (
												<button
													disabled={it.lang_code === lang_code}
													onClick={() => navigate(langSwitcher(lang,
														currentURL, it.lang_code))}
													className={clsx('b_1 reg ri', {
														'active': it.lang_code === lang_code
													})}
													key={it.lang_code}>
													{it.label}
												</button>
											))}
										</div>
									</li>
									<li>
										<span>
											{sec_settings.theme.title}
										</span>
										<div className='flex gap-4'>
											<button
												disabled={theme === "system"}
												className={clsx("b_1 reg ri",
													{ 'active': theme === "system" }
												)}
												type="button"
												onClick={() => onChangeSettings(
													'theme', 'system')}
											>
												{sec_settings.theme.b_system}
											</button>
											<button
												disabled={theme === "light"}
												className={clsx("b_1 reg ri",
													{ 'active': theme === "light" },
												)}
												type="button"
												onClick={() => onChangeSettings(
													'theme', 'light')}
											>
												{sec_settings.theme.b_light}

											</button>
											<button
												disabled={theme === "dark"}
												className={clsx("b_1 reg ri",
													{ 'active': theme === "dark" },
												)}
												type="button"
												onClick={() => onChangeSettings(
													'theme', 'dark')}
											>
												{sec_settings.theme.b_dark}
											</button>
										</div>
									</li>
									<li>
										<span>
											{sec_settings.font_size.title}
										</span>
										<div className='flex gap-4 items-center'>
											<button
												onClick={() => onChangeSettings('font_size', font_size - 5)}
												className="b_1 reg ri"
											>
												{font_size - 5}%
											</button>
											<div>
												{font_size}%
											</div>
											<button
												onClick={() => onChangeSettings('font_size', font_size + 5)}
												className="b_1 reg ri"
											>
												{font_size + 5}%
											</button>
											{font_size !== 100 &&
												<button
													onClick={() => onChangeSettings('font_size', 100)}
													className="b_1 reg ri"
												>
													{sec_settings.font_size.b_reset}
												</button>}
										</div>
									</li>
									<li>
										<span>
											{sec_settings.grayscale.title}
										</span>
										<div className='flex gap-4'>
											<button
												disabled={!ui_grayscale}
												onClick={() => onChangeSettings('ui_grayscale', false)}
												className={clsx('b_1 reg ri', { 'active': !ui_grayscale })}
											>
												{sec_settings.grayscale.b_colors}
											</button>
											<button
												disabled={ui_grayscale}
												onClick={() => onChangeSettings('ui_grayscale', true)}
												className={clsx('b_1 reg ri', { 'active': ui_grayscale })}
											>
												{sec_settings.grayscale.b_gray}
											</button>
										</div>
									</li>
									<li>
										<span>
											{sec_settings.contrast.title}
										</span>
										<div className='flex gap-4'>
											<button
												disabled={!ui_high_contrast}
												onClick={() => onChangeSettings('ui_high_contrast', false)}
												className={clsx('b_1 reg ri', { 'active': !ui_high_contrast })}
											>
												{sec_settings.contrast.regular}
											</button>
											<button
												disabled={ui_high_contrast}
												onClick={() => onChangeSettings('ui_high_contrast', true)}
												className={clsx('b_1 reg ri', { 'active': ui_high_contrast })}
											>
												{sec_settings.contrast.high_contrast}
											</button>
										</div>
									</li>
								</ul>
							</div>
						</NavigationMenu.Content>
					</NavigationMenu.Item>
				</NavigationMenu.List>

				<NavigationMenu.Indicator className="NavigationMenuIndicator top-full z-10 flex h-2.5 items-end justify-center overflow-hidden transition-[width,transform_250ms_ease]">
					<div className="relative top-[60%] size-2.5 rotate-45 rounded-tl-sm bg-neutral-300 dark:bg-neutral-700" />
				</NavigationMenu.Indicator>

				<div className="perspective-[2000px] absolute left-0 top-full flex w-full justify-end">
					<NavigationMenu.Viewport className="NavigationMenuViewport relative mx-1 mb-3 mt-2.5 h-[var(--radix-navigation-menu-viewport-height)] w-full origin-[top_center] overflow-hidden rounded-md transition-[width,_height] duration-300 data-[state=closed]:animate-scaleOut data-[state=open]:animate-scaleIn w-[var(--radix-navigation-menu-viewport-width)] bg-neutral-100 dark:bg-neutral-900 shadow shadow-neutral-400 dark:shadow-neutral-600" />
				</div>
			</NavigationMenu.Root>
		</div>
	);
};


const NavListItem = ({
	title,
	description,
	type,
	urlOrPath,
	linkProps
}: {
	title: string,
	description?: string,
	type: "internal" | "external",
	urlOrPath: string,
	linkProps?: React.HTMLAttributes<HTMLAnchorElement>
}) => {
	const LinkElement = type === "internal" ? NavLink : Link

	return (
		<NavigationMenu.Link asChild>
			<LinkElement
				end={type === "internal"}
				viewTransition
				className="block p-3 b_x select-none rounded-md no-underline outline-none transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:ring ring-neutral-700 dark:ring-neutral-300"
				to={urlOrPath}
				{...linkProps}
			>
				<div className="mb-[5px] font-medium leading-[1.2]">
					{title}
				</div>
				{description && <p className="leading-[1.4]">{description}</p>}
			</LinkElement>
		</NavigationMenu.Link>
	)

}