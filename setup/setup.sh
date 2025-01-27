REGION=us-east-1

ENDPOINTURL=https://dynamodb.$REGION.amazonaws.com
# ENDPOINTURL=http://localhost:8000
OUTPUT=text

TableList=("MREC" "MRSC" "everysize")
TableName=""

if [ $# -gt 0 ]
  then
    aws dynamodb create-table --cli-input-json "file://$1.json" --region $REGION --endpoint-url $ENDPOINTURL --output $OUTPUT --query 'TableDescription.TableArn'
  else
    for TableName in "${TableList[@]}"
    do
        echo
        echo creating $TableName
        aws dynamodb create-table --cli-input-json file://$TableName.json --region $REGION --endpoint-url $ENDPOINTURL --output $OUTPUT --query 'TableDescription.TableArn'
        aws dynamodb wait table-exists --table-name $TableName --region $REGION --endpoint-url $ENDPOINTURL

        if [ $TableName == "MREC" ] 
        then
            echo updating $TableName to add regions
            aws dynamodb update-table --table-name $TableName --region $REGION --endpoint-url $ENDPOINTURL --output $OUTPUT --query 'TableDescription.TableStatus' --cli-input-json  \
                '{"ReplicaUpdates": [ 
                    {"Create": {"RegionName": "us-east-2" }} 
                ]}' 

            aws dynamodb wait table-exists --table-name $TableName --region $REGION --endpoint-url $ENDPOINTURL
    
            aws dynamodb update-table --table-name $TableName --region $REGION --endpoint-url $ENDPOINTURL --output $OUTPUT --query 'TableDescription.TableStatus' --cli-input-json  \
                '{"ReplicaUpdates": [ 
                    {"Create": {"RegionName": "us-west-2" }} 
                ]}'              
        fi

        if [ $TableName == "MRSC" ] 
        then
            echo updating $TableName to add regions
            aws dynamodb update-table \
                --table-name $TableName --region $REGION --endpoint-url $ENDPOINTURL   \
                --replica-updates '[{"Create": {"RegionName": "us-east-2"}}, {"Create": {"RegionName": "us-west-2"}}]' \
                --output $OUTPUT --query 'TableDescription.TableStatus' \
                --multi-region-consistency STRONG  
        fi
        
        aws dynamodb wait table-exists --table-name $TableName --region $REGION --endpoint-url $ENDPOINTURL
    
    done
    
fi

