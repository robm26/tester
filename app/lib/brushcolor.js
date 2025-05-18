// color of each dataset within a chart

const getBrushColor = (index, val) => {

    const colorList = ['MediumBlue','dodgerblue',  'maroon', 'crimson', 'lime', 'cyan', 'coral', 'plum'];
    
    return colorList[index];

};

export {getBrushColor};
