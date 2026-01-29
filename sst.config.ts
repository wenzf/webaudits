/// <reference path="./.sst/platform/config.d.ts" />

const { SST_APP_NAMESPACE } = await import('./app/site/site.config.ts')
const SITE_CONFIG = await import('./app/site/site.config.ts')
const { SST_SECRETS: { SECRETS, AWS: { AWS_PROFILE }, API_KEYS_FOR_LAMBDA_1,
  SECRETS_API_AND_CRON }
} = await import("./sst-secrets.ts")
const s3FilesDirectory = SITE_CONFIG.default.SITE_DEPLOYMENT.S3_BUCKET_FILES_FOLDER_NAME

export default $config({
  app(input) {
    return {
      name: SST_APP_NAMESPACE,
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",

      providers: {
        aws: {
          profile: AWS_PROFILE
        }
      }
    };
  },


  async run() {
    // link CloudFront to S3
    const bucket = new sst.aws.Bucket(`${SST_APP_NAMESPACE}_bucket`, {
      access: "cloudfront"
    });
    const router = new sst.aws.Router(`${SST_APP_NAMESPACE}_router`, {
      domain: {
        name: 'webaudits.org',
        redirects: ['www.webaudits.org']
      }
    })

    // environment variables deployed as AWS secrets 
    let sst_secrets: sst.Secret[] = []
    const secretArr = Object.entries(SECRETS!)
    for (let i = 0; i < secretArr.length; i += 1) {
      const [key, val] = secretArr[i]
      if (typeof val === "string") sst_secrets = [
        ...sst_secrets,
        new sst.Secret(key, val)]
    }

    let api_keys_for_lambda_1: sst.Secret[] = []
    const api_keys_for_lambda_1_arr = Object.entries(API_KEYS_FOR_LAMBDA_1!)
    for (let i = 0; i < api_keys_for_lambda_1_arr.length; i += 1) {
      const [key, val] = api_keys_for_lambda_1_arr[i]
      if (typeof val === "string") api_keys_for_lambda_1 = [
        ...api_keys_for_lambda_1,
        new sst.Secret(key, val)]
    }

    const sst_cron_secret = new sst.Secret('cron_job_secret_1', SECRETS_API_AND_CRON.cron_job_secret_1)
    const sst_audit_api_secret_1 = new sst.Secret('audit_api_secret_1', SECRETS_API_AND_CRON.audit_api_secret_1)
    const sst_audit_api_secret_2 = new sst.Secret('audit_api_secret_2', SECRETS_API_AND_CRON.audit_api_secret_2)

    // DynamoDB content
    const table = new sst.aws.Dynamo(`${SST_APP_NAMESPACE}_table`, {
      fields: {
        pk: "string",
        sk: "string",
        createdAt: "number"
      },
      primaryIndex: { hashKey: "pk", rangeKey: "sk" },
      globalIndexes: {
        CreatedAtIndex: { hashKey: "pk", rangeKey: "createdAt" }
      }
    }, { retainOnDelete: true });

    // DynamoDB audit data
    const table_audit = new sst.aws.Dynamo(`${SST_APP_NAMESPACE}_table_audit_v1`, {
      fields: {
        pk: "string",
        sk: "string",
        score: "number",
        created_at: "number"
      },
      primaryIndex: { hashKey: "pk", rangeKey: "sk" },
      globalIndexes: {
        scoreIndex: { hashKey: "pk", rangeKey: "score" },
        createdAtIndex: { hashKey: "pk", rangeKey: "created_at" },
      }
    }, { retainOnDelete: true });

    // CRON job calculate distribution stats
    const create_stats_cron_job = new sst.aws.Cron(`${SST_APP_NAMESPACE}_cj_1`, {
      schedule: "rate(1 day)",
      function: {
        handler: 'app/audit_api/v1/create_stats_cron_job.handler',
        link: [table_audit,
          sst_cron_secret
        ],
        timeout: "5 minutes",
        memory: '10240 MB',
        storage: '10 GB',
      }

    })

    // audit function
    const func2 = new sst.aws.Function(`${SST_APP_NAMESPACE}_function2`, {
      handler: "app/audit_api/v1/audit_lambda_function_1.handler",
      url: true,
      timeout: '5 minutes',
      memory: '10240 MB',
      storage: '10 GB',
      //concurrency: {
      // 
      //},
      link: [
        ...api_keys_for_lambda_1,
        //  table,
        table_audit,
        sst_audit_api_secret_1,
        sst_audit_api_secret_2
      ]
    });

    // react router app
    new sst.aws.React(`${SST_APP_NAMESPACE}_react_app`, {
      server: {
        timeout: '120 seconds'
      },
      link: [
        func2,
        table,
        table_audit,
        sst_audit_api_secret_2,

        ...sst_secrets
      ],
      router: {
        instance: router,
      },
    });

    router.routeBucket(`/${s3FilesDirectory}`, bucket);
  },
});
