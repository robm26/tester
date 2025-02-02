import {Link, useNavigation} from "@remix-run/react";

// import {config} from "~/configuration";
// import config from '../config.json' with { type: 'json' };
const config = require('../../config.json');

export function Menu(params) {
    const navigation = useNavigation();
    // ⏳

    let menuItemList = config.menuitems;

    const topLinks = (
        <ul className="menuList">
            <li key="0"  >
                <Link to="/" className='titleLink'>t e s t e r</Link>
            </li>
            <li className={['submitting', 'loading'].includes(navigation.state) ? 'menuHourglassListItemActive' : 'menuHourglassListItemDefault'}>
                <div className='menuHourglass'>
                    {['submitting', 'loading'].includes(navigation.state) ? "⏳" :  (<>&nbsp;&nbsp;&nbsp;&nbsp;</>)}
                </div>

            </li>

            {menuItemList.map((x,i) => {
                const menuLinkClass = params?.page === x ? 'menuLinkSelected' : 'menuLink';

                if(x === 'about') {
                    return (<li key={i+1}>
                        <Link to={"https://github.com/robm26/database-app"}
                              target="_blank" className={menuLinkClass}>
                            {x}
                        </Link>
                    </li>);
                }
                return (<li key={i+1}>
                    <Link to={"/" + x}  className={menuLinkClass}>
                        {x}
                    </Link>
                </li>);
            })}

        </ul>
    );

    return (
        <div id="menuContainer">
            {topLinks}
            <br/>
        </div>
    );
}

