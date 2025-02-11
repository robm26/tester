import { S3Client, ListObjectsV2Command, S3ServiceException, GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";


const listFolders = async (bucketName) => {

      const s3Client = new S3Client({});
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

    const client = new S3Client({});
    const command = new GetObjectCommand({  Bucket: bucketName, Key: 'exp/' + experiment + '/' + file});
    try {
        const response = await client.send(command);
        const body = await response.Body.transformToString();


// TODO  need to return correcty type, CSV, Obj, JSON, etc
    // split dataset into sections by the (Experiment.test) test value
        // if(file === 'summary.json') {
        //     console.log('sj');
        // } else {
        //     console.log('dc');
        // }

        // const fileDataObj = await csv().fromString(body);

        // let compareValues = Array.from(new Set(params.fileDataObj.map((line) => line['test'])));

        // console.log(typeof fileDataObj);
        // console.log(JSON.stringify(fileDataObj, null, 2));
        // console.log(file);
        // if(file === 'summary.json') {
        //     return JSON.parse(body);

        // }
        return body;

    } catch (error) {
        console.log('Error', error);
        return null;
    }   
}

export {listFolders, getDatafile};
