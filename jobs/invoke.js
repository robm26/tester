import { InvokeCommand, LambdaClient, LogType } from "@aws-sdk/client-lambda";
import config from '../config.json' with { type: 'json' };

console.log('config: ', config);

const payload = {
  expName: 'Reads.js',
  itemCount: 250,
  showEachRequest: false,
  waitForMinute: true,
  bucketName: config['bucketName'],
};

console.log('payload: ', payload);

const functionName = 'tester-function';

const invoke = async (funcName, payload) => {
    const client = new LambdaClient({});
    const command = new InvokeCommand({
      FunctionName: funcName,
      Payload: JSON.stringify(payload),
      LogType: LogType.Tail,
    });
  
    const { Payload, LogResult } = await client.send(command);
    const result = Buffer.from(Payload).toString();
    const logs = Buffer.from(LogResult, "base64").toString();
    return { logs, result };
};
  
const result = await invoke(functionName, payload);

console.log('invoke result: ');
console.log(result);

//console.log(JSON.stringify(JSON.parse(JSON.parse(result.result)),null,2));
