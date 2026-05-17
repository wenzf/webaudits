import { redirect } from "react-router";

import { Resource } from "sst";
import invariant from 'tiny-invariant'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import CMS_CONFIG from "~/cms/cms.config";
import { isAuth } from "~/cms/utils/auth/auth.server";
import SITE_CONFIG, { SST_APP_NAMESPACE } from "~/site/site.config";
import type { Route } from "./+types/cms_cd_s3";



/**
 * create delete files on S3
 */

export const action = async ({ request }: Route.ActionArgs) => {
    invariant(Resource.session_secret_1.value)

// @ts-expect-error sst var
    const bucket_namespace = Resource[`${SST_APP_NAMESPACE}_bucket`].name

    const { AUTH_CONFIG: { MIN_AUTH_LVL_EDIT_RIGHTS } } = CMS_CONFIG

    const { SITE_DEPLOYMENT: { S3_BUCKET_FILES_FOLDER_NAME,
        S3_BUCKET_IMAGES_FOLDER_NAME } } = SITE_CONFIG

    const jsonData = await request.json()

    try {
        const auth = await isAuth(request)
        if (auth < MIN_AUTH_LVL_EDIT_RIGHTS) throw redirect('/', { status: 302 })
    } catch (error) {
        return redirect('/', { status: 302 })
    }

    const requestType = jsonData?.requestType
    if (typeof requestType === 'string') {

        // SIGNED UPLOAD URLS
        if (requestType === "requestSignedURLs") {
            const specsForFilesToUpload = jsonData.specsForFilesToUpload

            let commands: Promise<string>[] = []

            for (let i = 0; i < specsForFilesToUpload.length; i += 1) {
                let suffix = ""
                if (specsForFilesToUpload[i].mimeType === 'image/png') {
                    suffix = "png"
                } else if (specsForFilesToUpload[i].mimeType === 'image/webp') {
                    suffix = "webp"
                } else if (specsForFilesToUpload[i].mimeType === 'image/jpeg') {
                    suffix = "jpg"
                } else if (specsForFilesToUpload[i].mimeType === "video/mp4") {
                    suffix = "mp4"
                } else if (specsForFilesToUpload[i].mimeType === "video/webm") {
                    suffix = "webm"
                } else if (specsForFilesToUpload[i].mimeType === "application/pdf") {
                    suffix = "pdf"
                } else if (specsForFilesToUpload[i].mimeType === "image/svg+xml") {
                    suffix = "svg"
                }

                const command = new PutObjectCommand({
                    Key: specsForFilesToUpload[i].pathTo + crypto.randomUUID() + '.' + suffix,
                    //        Bucket: Resource.rrsstaws_bucket.name,
                                                            Bucket: bucket_namespace
//                    Bucket: Resource[`${SST_APP_NAMESPACE}_bucket`].name
                });
                commands = [...commands, getSignedUrl(new S3Client({
                    region: "eu-central-1",
                }), command)]
            }
            try {
                const presignedUrls: string[] = await Promise.all(commands)
                let outp: Record<string, string | number>[] = []

                for (let i = 0; i < presignedUrls.length; i += 1) {
                    outp = [...outp, { ...specsForFilesToUpload[i], signedUrl: presignedUrls[i] }]
                }

                return Response.json({ requestType, resp: outp })

            } catch (err) {
                return Response.json({ requestType, resp: null })

            }

            // DELETE FILES
        } else if (requestType === "deleteFiles") {
            const keys = jsonData.keys
            let deleteFilesCommands: DeleteObjectCommand[] = []

            for (let i = 0; i < keys.length; i += 1) {
                const command = new DeleteObjectCommand({
                    Key: keys[i],
                    Bucket: bucket_namespace
                })
                deleteFilesCommands = [...deleteFilesCommands, command]
            }

            try {
                const client = new S3Client({ region: 'eu-central-1' })
                // delete images
                for (let i = 0; i < deleteFilesCommands.length; i += 1) {
                    await client.send(deleteFilesCommands[i])
                }
                // delete folder
                //                const namespace = 'rrsstaws'
                await client.send(new DeleteObjectCommand({
                    // ${S3_BUCKET_FILES_FOLDER_NAME}/${S3_BUCKET_IMAGES_FOLDER_NAME}
                    // Key: `media/${jsonData.folder}/`,
                    Key: `${S3_BUCKET_FILES_FOLDER_NAME}/${S3_BUCKET_IMAGES_FOLDER_NAME}/${jsonData.folder}/`,
                    //    Bucket: Resource.rrsstaws_bucket.name
                 //   Bucket: Resource[`${SST_APP_NAMESPACE}_bucket`].name
                                        Bucket: bucket_namespace
                }))

                return Response.json({ requestType, res: 'ok' })

            } catch {
                return Response.json({ requestType, res: null })
            }


        }
    }

    return null
}


export const loader = () => redirect('/', { status: 404 })




