
export const SST_SECRETS: Record<string, string | Record<string, string>> = {
    AWS: {
        AWS_PROFILE: 's3cret'
    },
    SECRETS: {
        admin_un_hash_1: "s3cret",
        admin_pw_hash_1: "s3cret",
        cookie_secret_1: "s3cret",
        cookie_secret_2: "s3cret",
        cookie_secret_3: "s3cret",
        cookie_secret_4: "s3cret",
        session_secret_1: "s3cret",
        session_secret_2: "s3cret",
        session_secret_3: "s3cret",
        cron_job_secret_1: "s3cret"
    },
    SECRETS_API_AND_CRON: {
        secret_cron_job_secret_1: "s3cret",
        secret_audit_api_secret_1: "s3cret",
        secret_audit_api_secret_2: "s3cret",
    },
    API_KEYS_FOR_LAMBDA_1: {
        api_key_google_1: "s3cret",
        api_key_abuse_ipdb: "s3cret"
    }
}

