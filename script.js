function submit() {
    alert("submitted")
}


$(function () {
    $('.chips-initial').material_chip({
        readOnly: true,
        data: myData
    });
    var x = 1;
    $('.chips-placeholder').material_chip({
        placeholder: 'Enter a tag',
        secondaryPlaceholder: '+Tag',
    });

    $('.chips').material_chip();
    $("#tag-input")[0].after("...")
});

function onTagFocus() {
    element = $("#tag-input")
    console.log("there")
    console.log($("#tag-input"))
    if (element[0].value == "next Tag") {
        element[0].value = " "
        console.log("emptied")
    }
}

function onChange(element) {
    if (!element.value.endsWith(" ")) {
        element.value = element.value + " "
    }
}

function onEnter(element, event) {
    if(event.keyCode == 13){
        element.value = element.value + " "
    }
}
