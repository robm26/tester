import { S3Client, ListObjectsV2Command, S3ServiceException, GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";

import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

const listFolders = async (bucketName) => {

      const s3Client = new S3Client({
        followRegionRedirects: true
      });
      const listParams = { Bucket: bucketName, Prefix: 'exp/', Delimiter: 'i' };  
      let folderList = [];
      try {
          const data = await s3Client.send(new ListObjectsV2Command(listParams));
          if(!data || !data['Contents'] || data['Contents'].length === 0) {
              return([]);
          } else {
              return data['Contents'].map((x) => x.Key).map((x) => x.split('/')[1]).reverse();
          }
          
      } catch (error) {
          console.log('Error', error);
      }

};

const getDatafile = async(bucketName, experiment, file) => {

    const client = new S3Client({
        followRegionRedirects: true
    });
    const command = new GetObjectCommand({  Bucket: bucketName, Key: 'exp/' + experiment + '/' + file});
    try {
        const response = await client.send(command);
        const body = await response.Body.transformToString();

        return body;

    } catch (error) {
        console.log('Error', error);
        return null;
    }   
}

const getCallerIdentity = async () => {
    const client = new STSClient({});
    try {
        const data = await client.send(new GetCallerIdentityCommand({}));
        return data;
    } catch (error) {
        console.error("Error", error);
        return null;
    }
}


export {listFolders, getDatafile, getCallerIdentity};
