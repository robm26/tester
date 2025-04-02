
import css from './page.module.css';
import {listFolders} from './lib/aws.js';

import {getCallerIdentity} from './lib/aws.js';

import Link from 'next/link';
import LeftNav from './LeftNav.js';

import config from '@/config.json';

const bucketName = config['bucketName'];

export const metadata = {
  title: "Tester",
  description: "Database Test Results Dashboard",
};

export default async function RootLayout({ children }) {

  const folderList = await listFolders(bucketName);
  const myCI = await getCallerIdentity();

  return (
    <html lang="en">
      <body>
        <table className={css.layoutTable}>
          <thead><tr>
            <th colSpan='2'> 
              <Link href="/">tester</Link> &nbsp;&nbsp;&nbsp;
              <span>{'s3://' + bucketName + '/exp/'}</span>
              <br/>
              <span>{myCI?.Arn.split(':')[4] + ':' + myCI?.Arn.split(':')[5]}</span>

              {/* <Link href="/about">about</Link> */}
              </th>
            </tr></thead>
          <tbody>
            <tr>
              <td className={css.leftNavCell}>
                <LeftNav folders={folderList}/>
              </td>
              <td>
                  {children}
              </td>
            </tr>

          </tbody>
        </table>
        
      </body>
    </html>
  );
}
