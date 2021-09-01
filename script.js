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
        let cell=$(`<div class="input-cell" contenteditable="false" id="${colNo}${i}" cell-address="${colNo}${i}"></div>`);
        row.append(cell);
    }

    $(".input-cell-container").append(row);
}

$(".align-icon").click(function(){
    if($(this).hasClass("selected")) $(".align-icon.selected").removeClass("selected");
    else{
        $(".align-icon.selected").removeClass("selected");
        $(this).addClass("selected");
    }
});

$(".style-icon").click(function(){
    $(this).toggleClass("selected");
});

$(".input-cell").click(function(){
    $(".input-cell.selected").removeClass("selected");
    $(this).addClass("selected");
});
});

