import css from './page.module.css';
import { S3Client, ListObjectsV2Command, S3ServiceException, GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";
import config from '@/app/config.json';

const bucketName = config['bucketName'];

export default async function Home() {

  return (
    <div className={css.canvas}>
      <main className={null}>
        <div className={css.hello}>
        hello
        </div>
         
      </main>
      <footer className={null}>

      </footer>
    </div>
  );
}
