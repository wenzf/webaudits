import { CheckCircledIcon, CrossCircledIcon, EyeOpenIcon, Link1Icon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons"
import { Form, NavLink, useRouteLoaderData } from "react-router"
import { Fragment } from "react"
import clsx from "clsx"

import { createPathByPKAndSK, parseJSON } from "~/common/shared/misc"
import CopytToClipboardButton from "../generics/g_copy_to_clipboard_button"
import SaveIcon from "~/cms/assets/icons/icon_save"
import type { ContentBase, DBILFull } from "../../../../types/site"
import { AuthenticityTokenInput } from "remix-utils/csrf/react"


export const CmsDBViewRows = ({
    loaderData,
    entryTypeFromParam,
    expandElement,
    isEditing,
    dispatch,
    hasEditRights,
    onDeletePost,
    onDeleteFile,
    entryType,
    isEditingValidJson

}: {
    loaderData: any,
    entryTypeFromParam: any,
    expandElement: string | null,
    isEditing: boolean
    dispatch: any,
    hasEditRights: boolean
    onDeletePost: (a: string, b: string) => void
    onDeleteFile: (a: any) => void,
    entryType: any,
    isEditingValidJson: boolean
}) => {

    const {
        locTxt: {
            database: {
                db_confirm_delete,
            },
            ui_labels: {
                ui_not_allowed_in_guest_mode
            },
        } } = useRouteLoaderData('cms/routes/layouts/cms_root_layout')

    return (
        <tbody>
            {loaderData.Items.map((it: DBILFull & ContentBase) => (
                <Fragment key={it.pk + it.sk}>
                    <tr>
                        <td>{it.pk}</td>
                        <td>{it.sk}</td>

                        {entryTypeFromParam === "doc" ? (
                            <td>{it.title}</td>
                        ) : null}

                        {entryTypeFromParam === "file" ? (
                            <td>{it.categories?.length ? (
                                <ul
                                    className="ul_1"
                                    style={{
                                        marginTop: 0,
                                        marginBottom: 0
                                    }}
                                >
                                    {it.categories.map((itt) => (
                                        <li key={itt}>{itt}</li>
                                    ))}
                                </ul>
                            ) : null}
                            </td>

                        ) : null}

                        <td>
                            <div className="flex gap-2">
                                <button
                                    className="btn_1 icon small"
                                    type="button"
                                    onClick={() => {
                                        const thisid = `${it.pk}-${it.sk}`
                                        const expand = expandElement === thisid ? null : thisid
                                        const editing = !expand ? false : isEditing
                                        dispatch([{ expandElement: expand, isEditing: editing }])
                                    }}
                                >
                                    <EyeOpenIcon width={20} height={20} aria-hidden />
                                </button>

                                {entryTypeFromParam === "doc" &&
                                    <NavLink
                                        viewTransition
                                        className="btn_1 icon small"
                                        to={createPathByPKAndSK(it.pk, it.sk)}
                                    >
                                        <Link1Icon width={20} height={20} aria-hidden />
                                    </NavLink>
                                }

                                <CopytToClipboardButton
                                    buttonProps={{ className: 'btn_1 icon small' }}
                                    copyText={JSON.stringify(it) as string}
                                />

                                {expandElement === `${it.pk}-${it.sk}` ? (
                                    <button
                                        type="button"
                                        className="btn_1 icon small"
                                        onClick={() => dispatch([{ isEditing: !isEditing }])}
                                    >
                                        <Pencil1Icon width={20} height={20} aria-hidden />
                                    </button>
                                ) : null}
                                <details className="flex gap-2">
                                    <summary className="btn_1 icon reg small cursor-pointer">
                                        <TrashIcon width={20} height={20} aria-hidden />
                                    </summary>
                                    <button
                                        type="button"
                                        disabled={!hasEditRights}
                                        className="btn_4 reg"
                                        onClick={() => {
                                            if (entryType === "doc") {
                                                onDeletePost(it.pk, it.sk)
                                            } else if (entryType === "file") {
                                                onDeleteFile(it)
                                            } else {
                                                onDeletePost(it.pk, it.sk)
                                            }
                                        }}
                                    >
                                        {db_confirm_delete}
                                        {hasEditRights ? null : (
                                            <div>{ui_not_allowed_in_guest_mode}</div>
                                        )}
                                    </button>
                                </details>
                            </div>

                        </td>
                    </tr>
                    {expandElement === `${it.pk}-${it.sk}` ? (

                        <tr>
                            <td colSpan={4}>
                                {!isEditing ? (
                                    <pre className="bg_gray_2 text-[0.9375rem] p-2 col_gray_11 overflow-auto whitespace-pre-wrap">
                                        {JSON.stringify(it, null, 2)}
                                    </pre>
                                ) : (
                                    <Form method="POST" className="relative" onSubmit={() => dispatch([{ isEditing: false }])}>
                                        <input type="hidden" name="type" value="edit" />
                                        <textarea
                                            rows={20}
                                            style={{
                                                fontFamily: 'monospace',
                                                padding: '0.5rem',
                                                whiteSpace: 'break-spaces'
                                            }}
                                            className="inp_1 w-full"
                                            defaultValue={JSON.stringify(it, null, 2)}
                                            name="payload"
                                            onChange={(e) => {
                                                const isValid = parseJSON(e.currentTarget.value);
                                                dispatch([{ isEditingValidJson: isValid ? true : false }])
                                            }}
                                        />
                                        <div className="absolute top-2 right-5">
                                            {isEditingValidJson ? (
                                                <div className="flex gap-2 text-green-800 dark:text-green-200">
                                                    <span>JSON valid</span>
                                                    <CheckCircledIcon width={20} height={20} />
                                                </div>
                                            ) : (
                                                <div className="flex gap-2 text-amber-800 dark:text-amber-200">
                                                    <span>JSON not valid</span>
                                                    <CrossCircledIcon width={20} height={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                disabled={!isEditingValidJson || !hasEditRights}
                                                type="submit" className={clsx("btn_3", { icon: hasEditRights, 'flex p-2 gap-2': !hasEditRights })}>
                                                <SaveIcon width={20} height={20} aria-hidden />
                                                {hasEditRights ? null : ` ${ui_not_allowed_in_guest_mode}`}
                                            </button>
                                        </div>
                                        <AuthenticityTokenInput />
                                    </Form>
                                )}
                            </td>
                        </tr>

                    ) : null}
                </Fragment>
            ))}
        </tbody>

    )

}