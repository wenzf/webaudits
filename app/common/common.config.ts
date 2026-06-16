
// settings cookie
const SETTINGS_DEFAULT = {
    theme: "system",
    font_size: 100,
    show_cookie_consent_message: true,
    ui_high_contrast: false,
    ui_grayscale: false,
    msg_lang_hint: true,
    cms_show_hello_msg: true,
}

const S3_STORAGE_PATH_SEGMENTS: Record<string, string> = {
    S3_BUCKET_FILES_FOLDER_NAME: 'files',
    S3_BUCKET_IMAGES_FOLDER_NAME: 'images',
    S3_BUCKET_VIDEOS_FOLDER_NAME: 'videos',
    S3_BUCKET_DOCUMENTS_FOLDER_NAME: 'documents'
}



const AWS_DEPLOYMENT = {
    aws_region: "eu-central-1"
}


const COMMON_CONFIG = {
    SETTINGS_DEFAULT,
    S3_STORAGE_PATH_SEGMENTS,
    AWS_DEPLOYMENT
}


export default COMMON_CONFIG