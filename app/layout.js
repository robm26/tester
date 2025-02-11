
import css from './page.module.css';
import {listFolders} from './lib/s3.js';

import Link from 'next/link';
import LeftNav from './LeftNav.js';

const bucketName = 'tester-data';

export const metadata = {
  title: "Tester",
  description: "Database Test Results Dashboard",
};

export default async function RootLayout({ children }) {

  const folderList = await listFolders(bucketName);

  return (
    <html lang="en">
      <body>
        <table className={css.layoutTable}>
          <thead><tr>
            <th colSpan='2'> 
              <Link href="/">tester</Link> &nbsp;&nbsp;&nbsp;
              <Link href="/about">about</Link>
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
