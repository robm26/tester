
import css from '@/app/page.module.css';

const makeGrid = (data, options) => {
    if(!data) {
        return (<p>error: no data</p>);
    }

    const dataRows = data.split('\n');

    let newTable = (
        <div className={css.gridTableDiv}>
        <table className={css.gridTable} >
            <thead>
                <tr>
                    {dataRows[0].split(',').map((col, index) => {
                        return (<th key={index}>{col}</th>);
                    })}
                </tr>
            </thead>
            <tbody>

                {dataRows.map((row, idx) => {
                    const cols = row.split(',');
                    if(idx > 0) {
                        return (<tr key={'r' + idx}>
                            {cols.map((col, idx2) => {
                                return (<td key={'c' + idx2}>{col}</td>)
                            })}
                        </tr>)
                    }

                })}

            </tbody>
        </table>
        </div>
    );

    return newTable;

};

const makeStats = (stats, options) => {
    if(!stats || stats.length === 0) {
        return (<div></div>);
    }
    const cols = Object.keys(stats[0]);

    return(<table className={css.statsTable}><thead>
        <tr>
            <th>Test</th>
            <th>Action</th>
            <th>Items</th>
            <th>Average latency in ms</th>
     
        </tr>
        </thead><tbody>
            {stats.map((statline, ix) => {
                let color = getBrushColor(ix);


                return (<tr key={ix}>
                    {cols.map((col, ix2) => {
                        return (<td key={ix2} 
                            style={ix2 === cols.length - 1 ? {color:color, fontWeight:'bold', fontSize:'larger'} : {}}
                        >
                            {statline[col]}
                            </td>);
                    })}
                    </tr>);

            })}

        </tbody>
    </table>);

}

const makeLinearStats = (stats, options) => {

    const cols = Object.keys(stats[0]);
    return(<table className={css.statsTable}><thead>
        <tr>
            <th>Test</th>
            <th>Action</th>
            <th>Items</th>
            <th>Slope</th>
            <th>yIntercept</th>
            <th>Expected Latency in ms</th>
     
        </tr>
        </thead><tbody>
            {stats.map((statline, ix) => {
                let color = getBrushColor(ix);

                return (<tr key={ix}>
                    {cols.map((col, ix2) => {
                        return (<td key={ix2} 
                            style={ix2 >= cols.length - 2 ? {color:color, fontWeight:'bold', fontSize:'larger'} : {}}
                        >
                            {statline[col]}
                            </td>);
                    })}
                    <td key={'123'} style={{fontWeight:'bold'}} > ({statline['slope']} * itemSize) + {statline['yIntercept']}</td>

                    </tr>);

            })}

        </tbody>
    </table>);

}


const getBrushColor = (index, val) => {

    const colorList = ['MediumBlue','dodgerblue',  'maroon', 'crimson', 'lime', 'cyan'];
    return colorList[index];
  
}

export {makeGrid, makeStats, makeLinearStats, getBrushColor};
