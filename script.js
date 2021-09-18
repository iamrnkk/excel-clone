//  ------------------ Global Parameters ------------------------------------
const defaultProperties= {
    text: "",
    "font-weight": "",
    "font-style":"",
    "text-decoration":"",
    "text-align": "left",
    "background-color": "#ffffff",
    "color": "#000000",
    "font-family": "Arial",
    "font-size": "14px"
};

const cellData={
    "Sheet1": {}
};

const sheetNames={
    "Sheet1": "Sheet1"
};

const formulaData={"Sheet1":{}};
const formulaSchema={};
const formulaProperties={
    value: undefined,
    formula: undefined,
    upstream:[],
    downstream:[]
};

let selectedSheet= "Sheet1";
let totalSheets= 1;
let currentSheetNo=1;

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
            formulaSchema[cell.attr("cell-address")]={...formulaProperties};
            $(cell).click(function(){
                $(".selected-cell").text($(this).attr("cell-address"));
            });
            row.append(cell);
        }

        $(".input-cell-container").append(row);
    }

    formulaData["Sheet1"]= JSON.parse(JSON.stringify(formulaSchema));
    
    $(".menu-help").click(function(e){
        e.stopPropagation();
        openHelpModal();
    });

    cutCopyPaste();

    $(".font-family-selector").change(function(){
        updateCell("font-family",$(this).val());
        $(".font-family-selector").css("font-family",$(this).val());
    });

    $(".font-size-selector").change(function(){
        updateCell("font-size",$(this).val());
    });

    // add .selected class when selected
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

    $(".color-fill").click(function(){
        $(".fill-color-picker").click();
    });
    
    $(".fill-color-picker").change(function(){
        updateCell("background-color",$(this).val());
    });

    $(".color-text").click(function(){
        $(".text-color-picker").click();
    });

    $(".text-color-picker").change(function(){
        updateCell("color",$(this).val());
    });

    $(".formula-input").keydown(function(e){
        removeMultipleSelect();
        $(".input-cell.selected").removeClass("selected");
        $(".input-cell.last-selected").addClass("selected");
        
        if($(".formula-input").text() != "" && e.which==13)
        {
            updateCellUsingFormula(this);
            $(".formula-input").blur();
        }
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
                    $(".input-cell.last-selected").removeClass("last-selected");
                    $(this).addClass("top-cell-selected last-selected");
                    $(`#row-${rowId-1}-col-${colId}`).addClass("bottom-cell-selected");
                }
            }
            if(colId<100)
            {
                let rightCellSelected= $(`#row-${rowId}-col-${colId+1}`).hasClass("selected");
                if(rightCellSelected)
                { 
                    $(".input-cell.last-selected").removeClass("last-selected");
                    $(this).addClass("right-cell-selected last-selected");
                    $(`#row-${rowId}-col-${colId+1}`).addClass("left-cell-selected");
                }
            }
            if(rowId<100)
            {
                let bottomCellSelected= $(`#row-${rowId+1}-col-${colId}`).hasClass("selected");
                if(bottomCellSelected)
                { 
                    $(".input-cell.last-selected").removeClass("last-selected");
                    $(this).addClass("bottom-cell-selected last-selected");
                    $(`#row-${rowId+1}-col-${colId}`).addClass("top-cell-selected");
                }
            }
            if(colId>1) 
            {
                let leftCellSelected= $(`#row-${rowId}-col-${colId-1}`).hasClass("selected");
                if(leftCellSelected)
                { 
                    $(".input-cell.last-selected").removeClass("last-selected");
                    $(this).addClass("left-cell-selected last-selected");
                    $(`#row-${rowId}-col-${colId-1}`).addClass("right-cell-selected");
                }
            }
        }
        else
        {
            removeMultipleSelect();
            $(".input-cell.last-selected").removeClass("last-selected");
            $(".input-cell.selected").removeClass("selected");
            $(".input-cell.last-selected").removeClass("last-selected");
            $(this).addClass("last-selected");
            $(".input-cell[contenteditable=true]").attr("contenteditable","false");
        }
        $(this).addClass("selected");

        changeHeader(this);
    });

    $(".input-cell").dblclick(function()
    {
        removeMultipleSelect();
        $(".input-cell.last-selected").removeClass("last-selected");
        $(".input-cell.selected").removeClass("selected");
        $(this).addClass("selected last-selected");
        $(this).attr("contenteditable","true");
        $(this).focus();
    });

    $(".input-cell").blur(function(){
        updateCell("text",$(this).text());
        updateCellDirectly(this);
    });

    $(".input-cell-container").scroll(function(){
        $(".col-name-container").scrollLeft(this.scrollLeft);
        $(".row-name-container").scrollTop(this.scrollTop);
    });

    $(".icon-add").click(function(){
        emptySheet();
        $(".sheet-tab.selected").removeClass("selected");
        totalSheets+= 1;
        currentSheetNo+=1;
        selectedSheet= "Sheet"+currentSheetNo;
        cellData[selectedSheet]={};
        formulaData[selectedSheet]=JSON.parse(JSON.stringify(formulaSchema));
        sheetNames[selectedSheet]=selectedSheet;
        $(".sheet-tab-container").prepend(`<div class="sheet-tab selected" name=${selectedSheet}>${selectedSheet}</div>`);
        addSheetEvents();
    });

    addSheetEvents();

    $(".icon-scroll-left").click(function(){
        $(".sheet-tab.selected").prev(".sheet-tab").click();
        $(".sheet-tab.selected")[0].scrollIntoView();
    });

    $(".icon-scroll-right").click(function(){
        $(".sheet-tab.selected").next(".sheet-tab").click();
        $(".sheet-tab.selected")[0].scrollIntoView();
    });

    $(".container").click(function(e){
        if($(".help-modal").length==1) $(".help-modal").remove();
        if($(".sheet-options-modal").length==1) $(".sheet-options-modal").remove();
        else $(".sheet-rename-modal").remove();
        
    });

});

// ------------------------ Functions section ---------------------------------

function openHelpModal(){
    $(".container").append(`<div class="modal help-modal">
                                <div class="modal-header">Help</div>
                                <div class="modal-body">
                                <ul>
                                    <li><strong>Welcome to Excel Clone.</strong></li>
                                    <li><span>Basic: </span>Type numbers or text in Cells.</li>
                                    <li><span>Formatting: </span>Apply formatting by Selecting the cells and picking up formatting options from Menu Icon Bar.</li>
                                    <li><span>Multiple Select: </span>Select multiple Cells by pressing and holding ctrl key.</li>
                                    <li><span>Add Sheets: </span>Add more Sheets by clicking on + in Sheet Bar.</li>
                                    <li><span>Rename/Delete Sheets: </span>Right click on sheet to do the needful.</li>
                                    <li><span>Formula: </span>Calculate Basic mathematical operations on cell By typing formula in Formula Bar. format: (2*A1 + 3/B1) where A1 and B1 are cell-addresses. </li>
                                </ul>
                                </div>
                                <div class="modal-footer"><div class="action-button ok-button">Ok</div></div>
                            </div>`);
    
        $(".help-modal").click(function(event){
            event.stopPropagation();
        });
        $(".ok-button").click(function(){
            $(".help-modal").remove();
        });
    
}
function addSheetEvents()
{
    $(".sheet-tab.selected").click(function(){
        if(!$(this).hasClass("selected")) switchSheet(this);
    });

    $(".sheet-tab.selected").contextmenu(function(e){
        e.preventDefault();
        switchSheet(this);
        if($(".sheet-options-modal").length==0)
        {
            $(".container").append(`<div class="modal sheet-options-modal">
                                        <div class="sheet-option sheet-rename">Rename</div>
                                        <div class="sheet-option sheet-delete">Delete</div>
                                    </div>`);

            $(".sheet-rename").click(function()
            {
                if($(".sheet-rename-modal").length==0)
                {
                    $(".container").append(`<div class="modal sheet-rename-modal">
                                                <h3>Rename Sheet To:</h3>
                                                <input type="text"  class="new-sheet-name" placeholder="Sheet Name">
                                                <div class="action-buttons">
                                                    <div class="action-button submit-button">Submit</div>
                                                    <div class="action-button cancel-button">Cancel</div>
                                                </div>
                                            </div>`);
                    
                    $(".sheet-rename-modal").click(function(event){
                        event.stopPropagation();
                    });

                    $(".cancel-button").click(function(){
                        $(".sheet-rename-modal").remove();
                    });

                    $(".submit-button").click(function(){
                        let newSheetName= $(".new-sheet-name").val();
                        let oldSheetName= $(".sheet-tab.selected").text();
                        delete sheetNames[oldSheetName];
                        sheetNames[newSheetName]= $(".sheet-tab.selected").attr("name");
                        selectedSheet=sheetNames[newSheetName];
                        $(".sheet-tab.selected").text(newSheetName);
                        $(".sheet-rename-modal").remove();
                    });
                }
            });

            $(".sheet-delete").click(function(){
                if(Object.keys(cellData).length>1)
                {
                 let deletedSheet=$(".sheet-tab.selected");
                 let deletedSheetName= selectedSheet;
                 let deletedSheetIndex = Object.keys(cellData).indexOf(deletedSheetName);
                 
                 if(deletedSheetIndex==0) $(".sheet-tab.selected").prev().click();
                 else  $(".sheet-tab.selected").next().click();
                 
                 delete sheetNames[deletedSheet.text()];
                 delete cellData[deletedSheetName];
                 delete formulaData[deletedSheetName];
                 deletedSheet.remove();
                 totalSheets-=1;
                 selectedSheet=  $(".sheet-tab.selected").attr("name");
                 console.log(selectedSheet);
                }
                else alert("Sorry, there is only one sheet. It cannot be deleted");
            });
            
        }
        
        $(".sheet-options-modal").css("left",e.pageX+"px");
    });
    
}

function getRowCol(e)
{
    let id= $(e).attr("id").split("-");
    let rowId= parseInt(id[1]);
    let colId= parseInt(id[3]);

    return [rowId,colId];
}

function removeMultipleSelect()
{
    $(".input-cell.top-cell-selected").removeClass("top-cell-selected");
    $(".input-cell.right-cell-selected").removeClass("right-cell-selected");
    $(".input-cell.bottom-cell-selected").removeClass("bottom-cell-selected");
    $(".input-cell.left-cell-selected").removeClass("left-cell-selected");
}

function changeHeader(e)
{
    let [rowId,colId]= getRowCol(e);
    let formula =formulaData[selectedSheet][$(e).attr("cell-address")].formula;
    
    let cellInfo= defaultProperties;
    if(cellData[selectedSheet][rowId] &&  cellData[selectedSheet][rowId][colId]) 
        cellInfo= cellData[selectedSheet][rowId][colId];
    
    if(formula) $(".formula-input").text(formula);
    else $(".formula-input").text("");

    $(".font-family-selector").val(cellInfo["font-family"]);
    $(".font-family-selector").css("font-family",cellInfo["font-family"]);
    $(".font-size-selector").val(cellInfo["font-size"]);

    cellInfo["font-weight"]? $(".icon-bold").addClass("selected"):$(".icon-bold").removeClass("selected");
    cellInfo["text-decoration"]? $(".icon-underline").addClass("selected"):$(".icon-underline").removeClass("selected");
    cellInfo["font-style"]? $(".icon-italic").addClass("selected"):$(".icon-italic").removeClass("selected");

    let alignment= cellInfo["text-align"];
    $(".align-icon.selected").removeClass("selected");
    $(".icon-align-"+alignment).addClass("selected");

    $(".fill-color-picker").val(cellInfo["background-color"]);
    $(".text-color-picker").val(cellInfo["color"]);
}

function cutCopyPaste()
{
    let selectedCells = [];
    let cut = false;

    $(".icon-copy").click(function() {
        
        selectedCells = [];
        $(".input-cell.selected").each(function() {
            selectedCells.push(getRowCol(this));
        });
        cut=false;
        $(".icon-cut").removeClass("selected");
        $(".icon-copy").addClass("selected");
    });

    $(".icon-cut").click(function() {
        selectedCells = [];
        $(".input-cell.selected").each(function() {
            selectedCells.push(getRowCol(this));
        });
        cut = true;
        $(".icon-copy").removeClass("selected");
        $(".icon-cut").addClass("selected");
    })

    $(".icon-paste").click(function() {
        if(selectedCells.length==0) return;
        emptySheet();
        let [rowId,colId] = getRowCol($(".input-cell.selected")[0]);
        let rowDistance = rowId - selectedCells[0][0];
        let colDistance = colId - selectedCells[0][1];
        for(let cell of selectedCells) {
            let newRowId = cell[0] + rowDistance;
            let newColId = cell[1] + colDistance;
            
            if(cellData[selectedSheet][cell[0]][cell[1]])
            {
                if(!cellData[selectedSheet][newRowId]) cellData[selectedSheet][newRowId] = {};
                cellData[selectedSheet][newRowId][newColId] = {...cellData[selectedSheet][cell[0]][cell[1]]};
            }

            if(cut) 
            {
                delete cellData[selectedSheet][cell[0]][cell[1]];
                if(Object.keys(cellData[selectedSheet][cell[0]]).length == 0)
                    delete cellData[selectedSheet][cell[0]];
            }
        }
        if(cut) {
            cut = false;
            selectedCells = [];
        }
        
        changeHeader($(".input-cell.selected")[0]);
        loadSheet();
        $(".icon-copy").removeClass("selected");
        $(".icon-cut").removeClass("selected");
    });
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

function emptySheet()
{
    removeMultipleSelect();
    $(".input-cell.selected").removeClass("selected");
    $(".input-cell.last-selected").addClass("selected");
    let sheetInfo= cellData[selectedSheet];
    $(".formula-input").text("");
    for(let rowId of Object.keys(sheetInfo))
    {
        for(let colId of Object.keys(sheetInfo[rowId]))
        {
            for(let property of Object.keys(defaultProperties))
            {
                if(property=="text") $(`#row-${rowId}-col-${colId}`).text("");
                else $(`#row-${rowId}-col-${colId}`).css(property,defaultProperties[property]);
            }
        }
    }
}

function loadSheet()
{
    if($(".input-cell.selected").length != 0){
        let currFormula=formulaData[selectedSheet][$(".input-cell.selected").attr("cell-address")].formula;
        $(".formula-input").text("");
        if(currFormula) $(".formula-input").text(currFormula);
    }
    let sheetInfo= cellData[selectedSheet];
    for(let rowId of Object.keys(sheetInfo))
    {
        for(let colId of Object.keys(sheetInfo[rowId]))
        {
            let cellInfo=sheetInfo[rowId][colId];
            for(let property of Object.keys(cellInfo))
            {
                if(property=="text") $(`#row-${rowId}-col-${colId}`).text(cellInfo[property]);
                else $(`#row-${rowId}-col-${colId}`).css(property,cellInfo[property]);
            }
        }
    }
}

function switchSheet(e)
{
    $(".sheet-tab.selected").removeClass("selected");
    $(e).addClass("selected");
    emptySheet();
    selectedSheet= $(e).attr("name");
    loadSheet();
    $(".sheet-tab.selected")[0].scrollIntoView();
}

function cycleFound(currCellAddress, childCellAddress)
{
    let currCellObj= formulaData[selectedSheet][currCellAddress];
    if(currCellObj.upstream.includes(childCellAddress)) return true;
    return false;
}

function isCharacterInvalid(char) {
    return /^[a-zA-Z]+$/.test(char) || !isNaN(char.charAt(0));
}

function updateCellDirectly(e)
{
    let currCellAddress=$(e).attr("cell-address");
    if(!formulaData[selectedSheet][currCellAddress]) formulaData[selectedSheet]=JSON.parse(JSON.stringify(formulaSchema));
    let currCellObj= formulaData[selectedSheet][currCellAddress];
    
    if(currCellObj.value==$(e).text()) return;
    
    currCellObj.value= $(e).text();
    currCellObj.formula= undefined;

    for (const parentCellAddress of currCellObj.upstream)
        removeFromDownstream(parentCellAddress,currCellAddress);
    
    currCellObj.upstream=[];

    for (const childCellAddress of currCellObj.downstream)
        updateChildren(childCellAddress);

    formulaData[selectedSheet][currCellAddress]=currCellObj;
    
    emptySheet();
    loadSheet();

}

function updateCellUsingFormula(e)
{
    if(!$(".input-cell.selected"))
    {
        alert("No Cell Selected!");
        return;
    }

    try {
        eval($(e).text().replace(/[^\W]|_/g, '1'));
    } catch (error) {
        console.log(error);
        console.log($(e).text());
        console.log($(e).text().replace(/[^\W]|_/g, '1'));
        alert("Invalid formula!");
        return;
    }

    let currCellAddress=$(".input-cell.selected").attr("cell-address");
    if(!formulaData[selectedSheet][currCellAddress]) formulaData[selectedSheet]=JSON.parse(JSON.stringify(formulaSchema));
    let currCellObj= formulaData[selectedSheet][currCellAddress];

    let expressionArray=$(e).text().split(/[^\w]|_/g);
    let formulaArray=[];

    for (const token of expressionArray)
    {
        if(!isNaN(token)) continue;
        else if(isCharacterInvalid(token))
        {
            alert("Invalid Cell Addresses!");
            return;
        }
        else formulaArray.push(token);
    } 

    for (const parentCellAddress of formulaArray)
    {
        if(cycleFound(parentCellAddress,currCellAddress))
        {
            alert("Invalid Formula, Cycle Detected!");
            return;
        }
    }

    currCellObj.formula= $(e).text();
    for (const parentCellAddress of currCellObj.upstream)
        removeFromDownstream(parentCellAddress,currCellAddress);
    
    currCellObj.upstream=formulaArray;
    
    for (const parentCellAddress of currCellObj.upstream)
        addToDownstream(parentCellAddress,currCellAddress);
    updateChildren(currCellAddress);

    formulaData[selectedSheet][currCellAddress]=currCellObj;
    emptySheet();
    loadSheet();
}

function addToDownstream(parentCellAddress, childCellAddress)
{
    formulaData[selectedSheet][parentCellAddress].downstream.push(childCellAddress);
}

function removeFromDownstream(parentCellAddress, childCellAddress)
{
    let parentDownstream= formulaData[selectedSheet][parentCellAddress].downstream;
    let index=parentDownstream.indexOf(childCellAddress);
    parentDownstream.splice(index,1);
    formulaData[selectedSheet][parentCellAddress].downstream= parentDownstream;
}

function updateChildren(cellAddress)
{
    let cellObj= formulaData[selectedSheet][cellAddress];
    let formula= cellObj.formula;

    let parentHasValue= true;
    for (const parentCellAddress of cellObj.upstream)
    {
        if(!formulaData[selectedSheet][parentCellAddress].value)
        {
            parentHasValue= false;
            break;
        }
        formula= formula.replace(parentCellAddress,formulaData[selectedSheet][parentCellAddress].value);
    }
    if(parentHasValue){
        formulaData[selectedSheet][cellAddress].value= eval(formula);

        let [rowId, colId] =getRowCol($(`[cell-address= ${cellAddress}`));
        
        if(!cellData[selectedSheet][rowId]) cellData[selectedSheet][rowId]={};
        if(!cellData[selectedSheet][rowId][colId]) cellData[selectedSheet][rowId][colId]= {...defaultProperties};
        cellData[selectedSheet][rowId][colId]["text"]= formulaData[selectedSheet][cellAddress].value;
    }
    for (const childCellAddress of cellObj.downstream)
        if(childCellAddress!=cellAddress )updateChildren(childCellAddress);
    
}
// ----------------------------------------------------------------------------

