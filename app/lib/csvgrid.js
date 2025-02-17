'use client'
import css from '@/app/page.module.css';

import { useState } from 'react';

import { getBrushColor } from "@/app/lib/brushcolor.js";


const CsvGrid = (data) => {
    const [visibility, setVisibility] = useState(false);

    const dataRows = data['data'].split('\n');  
    const experiment = dataRows[1].split(',')[1];

    let gridTableSummary = (
        <span className={css.gridTableSummary}>

            {dataRows.length-1} rows &nbsp; 
            
            {/* download: &nbsp;&nbsp;
            <a href={'/experiments/' + experiment + '/data.csv'} download={experiment + '-data.csv'}>CSV</a>
             &nbsp;
             &nbsp; 

            <a href={'ms-excel:ofe|u|http://localhost:3000/experiments/' + experiment + '/data.csv'}
            download={experiment + '-data.csv'}>Excel</a>
            &nbsp; */}
            
            &nbsp; 

            <span onClick={() => setVisibility(!visibility)} style={{cursor: 'pointer'}}>
                {visibility ? 'Hide' : 'Show'} CSV Grid
            </span>
        </span>
    );

    let gridTable = (
        <div className={css.gridTableDiv}>

            {visibility ? 
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
            </table> : null}

        </div>
    );


    return (
      <div className={css.csvGridDiv}> 
        <br/>
        {gridTableSummary}
        {gridTable}
      </div>
    )
}

  
export default CsvGrid;
