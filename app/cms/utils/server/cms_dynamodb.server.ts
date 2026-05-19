import { Resource } from "sst";
import { DynamoDBClient, PutItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, type marshallOptions } from "@aws-sdk/util-dynamodb";

import { SST_APP_NAMESPACE } from "~/site/site.config";
import type { DBBase } from "../../../../types/site";


const client = new DynamoDBClient({
    region: 'eu-central-1',
    retryMode: "adaptive"

});


export const putDynamoDB = async (item: Record<string, unknown>,
    tableName: "_table" | "_table_audit_v1" = '_table'
) => {
    try {
        const Item = marshall(item, {
            convertClassInstanceToMap: true,
            removeUndefinedValues: true,
            allowImpreciseNumbers: true
        } as marshallOptions)

        const res = await client.send(
            new PutItemCommand({
                TableName: Resource[`${SST_APP_NAMESPACE}${tableName ?? '_table'}`].name,
                Item
            })
        )
        return res
    } catch (err: any) {
        return { name: err?.name, message: err?.message, meta: err?.$metadata, msg: 'catch put' }
    }
}


export const deleteDynamoDB = async (pk: DBBase["pk"], sk: DBBase["sk"],
    tableName: "_table" | "_table_audit_v1" = '_table'
) => {
    try {
        const res = await client.send(
            new DeleteItemCommand({
                TableName: Resource[`${SST_APP_NAMESPACE}${tableName ?? '_table'}`].name,
                Key: marshall({ pk, sk })
            })
        )
        return res
    } catch (err) {
        return err
    }
}

