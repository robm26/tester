// color of each dataset within a chart

const getBrushColor = (index, val) => {

    const colorList = ['MediumBlue','dodgerblue',  'maroon', 'crimson', 'lime', 'cyan'];
    
    return colorList[index];

};

export {getBrushColor};
