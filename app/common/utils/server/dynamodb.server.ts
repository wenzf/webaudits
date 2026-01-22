import { Resource } from "sst";
import {
    type AttributeValue,
    DynamoDBClient, QueryCommand,
    GetItemCommand,
    PutItemCommand,
    type PutItemCommandOutput,
    ScanCommand,
    UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import { SST_APP_NAMESPACE } from "~/site/site.config";
import type { DBBase } from "types/site";


const client = new DynamoDBClient({
    region: 'eu-central-1',
    retryMode: "ADAPTIVE",
    maxAttempts: 7
});


export const getDynamoDB = async (
    pk: DBBase["pk"],
    sk: DBBase["sk"],
    tableName: "_table" | "_table_audit_v1" = '_table',
    ProjectionExpression: string | undefined = undefined,
) => {
    if (pk === " " || sk === " ") return null
    try {
        const res = await client.send(
            new GetItemCommand({
                TableName: Resource[`${SST_APP_NAMESPACE}${tableName}`].name,
                Key: marshall({
                    pk, sk
                }),
                ProjectionExpression
            })
        )
        let outp = null
        if (res.Item) {
            const Item = unmarshall(res.Item)
            outp = { ...res, Item }
        }
        return outp
    } catch (error) {
        return null
    }
}

export const queryDynamoDB = async ({
    pk, Limit, ExclusiveStartKey, filterCats, ProjectionExpression,
    newsSitemapOnly, keywordSearch, isFeatured, tableName = "_table", IndexName
}: {
    pk: DBBase["pk"]
    Limit?: number
    ExclusiveStartKey?: Record<string, AttributeValue>
    filterCats?: string[]
    ProjectionExpression?: string
    newsSitemapOnly?: boolean
    authorId?: string
    keywordSearch?: string
    isFeatured?: boolean,
    tableName?: "_table" | "_table_audit_v1",
    IndexName?: string
}) => {
    try {
        let ExpressionAttributeValues: Record<string, AttributeValue> = { ":v1": { S: pk } }
        let FilterExpression: string | undefined = ""

        if (filterCats?.length) {
            for (let i = 0; i < filterCats.length; i += 1) {
                ExpressionAttributeValues = {
                    ...ExpressionAttributeValues,
                    [`:f${i}`]: { M: { "list_item_1": { S: decodeURIComponent(filterCats[i]) } } }
                }

                if (i !== 0) FilterExpression += " OR "
                FilterExpression += `contains (sec_1_categories_1, :f${i})`
            }
        }

        if (newsSitemapOnly) {
            ExpressionAttributeValues = {
                ...ExpressionAttributeValues,
                [`:newssitemap`]: { BOOL: true },
                [`:validtime`]: { N: `${Date.now() - 259200000}` }
            }
            if (FilterExpression) FilterExpression += " AND "
            FilterExpression += `in_news_sitemap = :newssitemap AND date_published > :validtime`
        }

        if (isFeatured) {
            ExpressionAttributeValues = {
                ...ExpressionAttributeValues,
                [`:is_featured`]: { BOOL: true },

            }
            if (FilterExpression) FilterExpression += " AND "
            FilterExpression += `is_featured = :is_featured`
        }

        if (keywordSearch) {
            ExpressionAttributeValues = {
                ...ExpressionAttributeValues,
                [`:keyword`]: { S: keywordSearch }
            }

            if (FilterExpression) FilterExpression += " AND "
            FilterExpression += `contains (plain_text, :keyword)`
        }

        const res = await client.send(
            new QueryCommand({
                TableName: Resource[`${SST_APP_NAMESPACE}${tableName ?? '_table'}`].name,
                KeyConditionExpression: `pk = :v1`,
                FilterExpression: FilterExpression ? FilterExpression : undefined,
                ExpressionAttributeValues,
                Limit,
                ExclusiveStartKey,
                ProjectionExpression,
                ScanIndexForward: false,
                IndexName
            })
        )

        let outp = {}
        if (res.Items) {
            if (res.Items.length) {
                let Items: Record<string, unknown>[] = []
                for (let i = 0; i < res.Items.length; i += 1) {
                    Items = [...Items, unmarshall(res.Items[i])]
                }
                outp = { ...res, Items }
            } else {
                outp = res
            }
        } else {
            outp = res
        }

        return outp
    } catch (err) {
        return null
    }
}



export const putDynamoDBBulk = async (Items: Record<string, unknown>[],
    tableName: "_table" | "_table_audit_v1" = '_table'
) => {
    try {
        let jobs: Promise<PutItemCommandOutput>[] = []
        for (let i = 0; i < Items.length; i += 1) {
            jobs = [...jobs, client.send(
                new PutItemCommand({

                    TableName: Resource[`${SST_APP_NAMESPACE}${tableName ?? '_table'}`].name,
                    Item: marshall(Items[i], { removeUndefinedValues: true, allowImpreciseNumbers: true }),
                    
                })
            )]
        }

        const allJobs = await Promise.all(jobs)
        return allJobs
    } catch (err) {
        return { err, msg: 'did catch upload' }
    }
}



export const scanDB = async (
    tableName: "_table" | "_table_audit_v1" = '_table'
) => {
    const res = await client.send(
        new ScanCommand({
            TableName: Resource[`${SST_APP_NAMESPACE}${tableName ?? '_table'}`].name,
        })
    )
    return res
}


export async function checkRateLimit(
    limitPerDuration: number = 100,
    duration: number = 24 * 60 * 60 * 1000,
    addTimestampOnRequest: boolean
): Promise<RateLimitResult> {
    try {
        const now = Date.now();
        const twentyFourHoursAgo = now - duration;
        const pk = "request-counter";
        const sk = "main";

        const getResult = await client.send(
            new GetItemCommand({
                TableName: Resource[`${SST_APP_NAMESPACE}_table_audit_v1`].name,
                Key: marshall({
                    pk, sk
                }),
            }));

        const item = unmarshall(getResult?.Item ?? {})

        // for first run if no entry is present
        if (!item) {
            const bulk = await putDynamoDBBulk([{
                pk,
                sk,
                requestTimestamps: [now],
                created_at: now ?? 1,
                score: 1,
            }], '_table_audit_v1')

            return {
                isAllowed: true,
                currentCount: 1,
                limitPerDuration,
            }
        }

        const timestamps: number[] = item?.requestTimestamps ?? []

        // remove older than duration
        const validTimestamps = timestamps.filter(ts => ts > twentyFourHoursAgo);

        const currentCount = validTimestamps.length;
        if (currentCount >= limitPerDuration) {
            return { isAllowed: false, currentCount, limitPerDuration };
        }

        // add now
        if (addTimestampOnRequest) validTimestamps.push(now);

        const update = await client.send(new UpdateItemCommand({
            TableName: Resource[`${SST_APP_NAMESPACE}_table_audit_v1`].name,
            Key: marshall({ pk, sk }),
            UpdateExpression: `SET requestTimestamps = :newList, score = :newScore`,
            ExpressionAttributeValues: marshall({
                ":newList": validTimestamps,
                ":newScore": validTimestamps.length
            }),
        }));

        return {
            isAllowed: true,
            currentCount,
            limitPerDuration,
        };

    } catch (err) {
        return err as any
    }
}