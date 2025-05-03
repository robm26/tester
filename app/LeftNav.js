'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import css from './page.module.css';

export default function LeftNav(props) {
    const folders = props['folders'];
    const pathname = usePathname();
    let activeFolder = null;
    if(pathname.slice(0,5) === '/exp/') {
        activeFolder = pathname.slice(5);
    }
    const uniqueFolders = [...new Set(folders)];

    return(
    <div className={css.leftNavDiv}>
        Experiments:
        <br/><br/>
        {uniqueFolders.map((folder, index) => {
            return (
            <div key={'folder-' + index} className={pathname.slice(5) === folder ? css.leftNavLinkActive :css.leftNavLink}>
                <Link href={"/exp/" + folder}>{folder}</Link>
            </div>
            );
        })}
    </div>
    );

}