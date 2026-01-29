import invariant from 'tiny-invariant'
import { Resource } from "sst";

import { queryDynamoDB, putDynamoDBBulk } from "~/common/utils/server/dynamodb.server"
import { frequencyStats, scoreFrequencies } from "../helpers/calculate_stats"

export const handler = async () => {
    invariant(Resource.cron_job_secret_1.value)
    const MAX_ENTRIES_PER_SITEMAP = 6_000

    // [pk, audit_time][]
    let sitemap_arr: [string, number][] = []
    /**
     * hard limit `sitemap_arr` of items to be stored in DynamoDB is around 9k
     * therefore, the audtis are stored in multiple items with `pk: sitemap-pages`
     */


    const init_archive_u8 = {
        score_uint8: new Uint8ClampedArray(101),
        score_e_uint8: new Uint8ClampedArray(101),
        score_c_uint8: new Uint8ClampedArray(101),
        score_o_uint8: new Uint8ClampedArray(101),
        score_s_uint8: new Uint8ClampedArray(101),
    }

    const queryDBCycle = async (
        store: {
            score_uint8: Uint8ClampedArray
            score_e_uint8: Uint8ClampedArray
            score_c_uint8: Uint8ClampedArray
            score_o_uint8: Uint8ClampedArray
            score_s_uint8: Uint8ClampedArray
        } = init_archive_u8,
        lastKey?: { pk: { S: string }, sk: { S: string } }

    ) => {
        let ExclusiveStartKey

        if (lastKey) ExclusiveStartKey = lastKey
        const res: any = await queryDynamoDB({
            pk: 'page',
            tableName: '_table_audit_v1',
            Limit: 300,
            ExclusiveStartKey
        })

        const items = res?.Items

        for (let i = 0; i < items.length; i += 1) {
            sitemap_arr = [...sitemap_arr, [items[i].sk, items[i].created_at]]
        }

        const _store = scoreFrequencies(store, items)

        if (res?.LastEvaluatedKey) {
            await queryDBCycle(_store.store, res?.LastEvaluatedKey)
        }

        return { store }
    }

    const res = await queryDBCycle(undefined, undefined)

    const store = {
        created_at: Date.now(),
        score_main: [...res.store.score_uint8],
        score_c: [...res.store.score_c_uint8],
        score_e: [...res.store.score_e_uint8],
        score_s: [...res.store.score_s_uint8],
        score_o: [...res.store.score_o_uint8],

        stats_score_main: frequencyStats(res.store.score_uint8),
        stats_score_c: frequencyStats(res.store.score_c_uint8),
        stats_score_e: frequencyStats(res.store.score_e_uint8),
        stats_score_o: frequencyStats(res.store.score_o_uint8),
        stats_score_s: frequencyStats(res.store.score_s_uint8)
    }


    const numberOfTotalAudits = sitemap_arr.length
    const numberOfSitemaps = Math.ceil(numberOfTotalAudits / MAX_ENTRIES_PER_SITEMAP)
    let sitemapArrOfArrs: [string, number][][] = []
    let tempArr: [string, number][] = []


    for (let i = 0; i < numberOfTotalAudits; i += 1) {
        tempArr = [...tempArr, sitemap_arr[i]]
        if (((i + 1) % MAX_ENTRIES_PER_SITEMAP === 0)) {
            sitemapArrOfArrs = [...sitemapArrOfArrs, tempArr]
            tempArr = []
        } else if (i === numberOfTotalAudits - 1) {
            sitemapArrOfArrs = [...sitemapArrOfArrs, tempArr]
        }
    }

    const put = await putDynamoDBBulk([{
        pk: 'page-stats',
        sk: 'main',
        ...store
    }], '_table_audit_v1')
    for (let i = 0; i < sitemapArrOfArrs.length; i += 1) {
        await putDynamoDBBulk([{
            pk: 'sitemap-pages',
            sk: `${i + 1}`,
            score: 0,
            created_at: 0,
            pages: sitemapArrOfArrs[i]
        }], '_table_audit_v1')
    }
    const putsi = await putDynamoDBBulk([{
        pk: 'sitemap-index',
        sk: 'main',
        score: numberOfSitemaps,
        createdAt: 0
    }], '_table_audit_v1')

    return Response.json({
        store,
        put
    })
}


