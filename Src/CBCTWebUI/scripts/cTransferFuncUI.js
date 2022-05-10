
var CTransferFuncUI = function () {
   
}
CTransferFuncUI.prototype.Init = function (domEleName) {
    this.domEleName = domEleName;
    this.tfGen = new CTransferTextureGen();
   
    var fatherThis = this;
    var chart = new Highcharts.Chart({

        chart: {
            renderTo: this.domEleName,
            animation: false
        },

        title: {
            text: 'Transfer Function'
        },

        xAxis: {
            min: 0,
            max: 255,
            tickInterval: 20
        },
        yAxis: {
            min: 0,
            max: 1,
            tickInterval: 0.2,
        },

        plotOptions: {
            series: {
                point: {
                    events: {

                        drag: function (e) {
                            // Returning false stops the drag and drops. Example:

                            //if (e.y > 1) {
                            //    this.y = 1;
                            //    return false;
                            //}
                            //else if (e.y < 0) {
                            //    this.y = 0;
                            //    return false;
                            //}

                            if (e.x > 254.999) {
                                e.x = 254.999;
                                return false;
                            }
                            else if (e.x < 0.001) {
                                e.x = 0.001;
                                return false;
                            }
                            if (e.dragStart.x == 0) {
                                e.x = 0;
                            }
                            if (e.dragStart.x == 255) {
                                e.x = 255;
                            }

                            //$('#drag').html(
                            //    'Dragging <b>' + this.series.name + '</b>, <b>' + this.category + '</b> to <b>' + Highcharts.numberFormat(e.y, 2) + '</b>');
                        },
                        drop: function () {

                            fatherThis.OnDrop(this);
                            //$('#drop').html(
                            //    'In <b>' + this.series.name + '</b>, <b>' + this.category + '</b> was set to <b>' + Highcharts.numberFormat(this.y, 2) + '</b>');
                        }
                    }
                },
                stickyTracking: false
            },
            column: {
                stacking: 'normal'
            },

        },

        tooltip: {
            yDecimals: 2
        },

        series: [{
            data: CContext.tfData,
            draggableY: true,
            draggableX: true
        }]

    });
}

CTransferFuncUI.prototype.OnDrop = function (pDrop) {
    var list = new Array();
    for (var i = 0; i < CContext.tfData.length; i++) {
        
        if (CContext.tfData[i].x == undefined)
            list.push({ x: CContext.tfData[i][0], y: CContext.tfData[i][1] });
        else
            list.push({ x: CContext.tfData[i].x, y: CContext.tfData[i].y });
    }
    var tfTexture = this.tfGen.GenTextureFromTFJointPair(list);
    for (var key in CContext.scene.volumeDataObjects) {
        CContext.scene.volumeDataObjects[key].SetTransferTexture(tfTexture);

    }
}

