//  ------------------ Global Parameters------------------------------------
const defaultProperties= {
    text: "",
    "font-weight": "",
    "font-style":"",
    "text-decoration":"",
    "text-align": "left",
    "background-color": "white",
    "color": "black",
    "font-family": "Arial",
};

const cellData={
    "Sheet1": {}
};

const selectedSheet= "Sheet1";
const totalSheets= 1;

// ----------------------------------------------------------------------------

$(document).ready(function(){

    // add row and col no in .col-name-container and .row-name-container
    for(let i=1; i<=100; i++)
    {
        let colNo="";
        let colCode=i;

        while(colCode != 0)
        {
            let rem= colCode%26;
            if(rem==0)
            {
                colNo= "Z"+colNo;
                colCode= Math.floor(colCode/26)-1;
            }
            else
            {
                colNo= String.fromCharCode(rem-1+65)+colNo;
                colCode=Math.floor(colCode/26);
            }
        }

        let col= $(`<div class="col-name col-id-${i}" id=${colNo} col-no=${colNo}>${colNo}</div>`);
        $(".col-name-container").append(col);

        let row= $(`<div class="row-name" id=${i}" row-no=${i}>${i}</div>`);
        $(".row-name-container").append(row);

    }

    // add cells in .input-cell-container
    for(let i=1; i<=100; i++)
    {
        let row= $(`<div class="cell-row"></div>`);
        for(let j=1; j<=100; j++)
        {
            let colNo= $(`.col-id-${j}`).attr("id");
            let cell=$(`<div class="input-cell"  id="row-${i}-col-${j}" cell-address="${colNo}${i}" contenteditable=false></div>`);
            row.append(cell);
        }

        $(".input-cell-container").append(row);
    }

    // add .selected class when selected
    $(".align-icon").click(function(){

        $(".align-icon.selected").removeClass("selected");
        $(this).addClass("selected");
    });

    $(".icon-align-left").click(function(){
        if($(this).hasClass("selected")) updateCell("text-align","left", true);
        
    });

    $(".icon-align-right").click(function(){
        if($(this).hasClass("selected")) updateCell("text-align","right", false);

    });

    $(".icon-align-center").click(function(){
        if($(this).hasClass("selected")) updateCell("text-align","center", false); 
    });

    $(".style-icon").click(function(){
        $(this).toggleClass("selected");
    });

    $(".icon-bold").click(function(){
        if($(this).hasClass("selected")) updateCell("font-weight","bold", false);
        else updateCell("font-weight","", true);
    });

    $(".icon-italic").click(function(){
        if($(this).hasClass("selected")) updateCell("font-style","italic", false);
        else updateCell("font-style","",true);
    });

    $(".icon-underline").click(function(){
        if($(this).hasClass("selected")) updateCell("text-decoration","underline",false);
        else updateCell("text-decoration","",true);
    });

    $(".input-cell").click(function(e){
        // multiple select
        if(e.ctrlKey)
        {
            let [rowId, colId]= getRowCol(this);

            if(rowId>1)
            {
                let topCellSelected= $(`#row-${rowId-1}-col-${colId}`).hasClass("selected");
                if(topCellSelected)
                { 
                    $(this).addClass("top-cell-selected");
                    $(`#row-${rowId-1}-col-${colId}`).addClass("bottom-cell-selected");
                }
            }
            if(colId<100)
            {
                let rightCellSelected= $(`#row-${rowId}-col-${colId+1}`).hasClass("selected");
                if(rightCellSelected)
                { 
                    $(this).addClass("right-cell-selected");
                    $(`#row-${rowId}-col-${colId+1}`).addClass("left-cell-selected");
                }
            }
            if(rowId<100)
            {
                let bottomCellSelected= $(`#row-${rowId+1}-col-${colId}`).hasClass("selected");
                if(bottomCellSelected)
                { 
                    $(this).addClass("bottom-cell-selected");
                    $(`#row-${rowId+1}-col-${colId}`).addClass("top-cell-selected");
                }
            }
            if(colId>1) 
            {
                let leftCellSelected= $(`#row-${rowId}-col-${colId-1}`).hasClass("selected");
                if(leftCellSelected)
                { 
                    $(this).addClass("left-cell-selected");
                    $(`#row-${rowId}-col-${colId-1}`).addClass("right-cell-selected");
                }
            }
        }
        else
        {
            $(".input-cell.top-cell-selected").removeClass("top-cell-selected");
            $(".input-cell.right-cell-selected").removeClass("right-cell-selected");
            $(".input-cell.bottom-cell-selected").removeClass("bottom-cell-selected");
            $(".input-cell.left-cell-selected").removeClass("left-cell-selected");

            $(".input-cell.selected").removeClass("selected");
            $(".input-cell[contenteditable=true]").attr("contenteditable","false");
        }
        $(this).addClass("selected");

        changeHeader(this);
    });

    $(".input-cell").dblclick(function(){
        $(".input-cell.selected").removeClass("selected");
        $(this).addClass("selected");
        $(this).attr("contenteditable","true");
        $(this).focus();
    });

    $(".input-cell-container").scroll(function(){
        $(".col-name-container").scrollLeft(this.scrollLeft);
        $(".row-name-container").scrollTop(this.scrollTop);
    });


// ------------------------ Functions section ---------------------------------

    function getRowCol(e)
    {
        let id= $(e).attr("id").split("-");
        let rowId= parseInt(id[1]);
        let colId= parseInt(id[3]);

        return [rowId,colId];
    }

    function changeHeader(e)
    {
        let [rowId,colId]= getRowCol(e);

        let cellInfo= defaultProperties;
        if(cellData[selectedSheet][rowId] &&  cellData[selectedSheet][rowId][colId] ) 
            cellInfo= cellData[selectedSheet][rowId][colId];


        cellInfo["font-weight"]? $(".icon-bold").addClass("selected"):$(".icon-bold").removeClass("selected");
        cellInfo["text-decoration"]? $(".icon-underline").addClass("selected"):$(".icon-underline").removeClass("selected");
        cellInfo["font-style"]? $(".icon-italic").addClass("selected"):$(".icon-italic").removeClass("selected");

        let alignment= cellInfo["text-align"];
        $(".align-icon.selected").removeClass("selected");
        $(".icon-align-"+alignment).addClass("selected");
    }


    function updateCell(property, val, defaultPossible)
    {
        $(".input-cell.selected").each(function(){
            $(this).css(property,val);

            let [rowId,colId]= getRowCol(this);
            if(!cellData[selectedSheet][rowId]) cellData[selectedSheet][rowId]={};
            if(!cellData[selectedSheet][rowId][colId]) cellData[selectedSheet][rowId][colId]= {...defaultProperties};
            cellData[selectedSheet][rowId][colId][property]= val;

            if(defaultPossible && JSON.stringify(cellData[selectedSheet][rowId][colId]) === JSON.stringify(defaultProperties))
            {
                delete cellData[selectedSheet][rowId][colId];
                if(Object.keys(cellData[selectedSheet][rowId]).length === 0) delete cellData[selectedSheet][rowId];
            }
        });

        console.log(cellData);
    }
// ----------------------------------------------------------------------------
});

