function submit() {
    alert("submitted")
}


$(function () {
    var copyLabel = $("#copy-label")
    copyLabel.hide()
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
    var childs = $("#tag-div")[0].children
    if (!element.value.endsWith(" ") && childs.length > 1) {
        element.value = element.value + " "
    }
}

function onEnter(element, event) {
    if (event.keyCode == 13) {
        element.value = element.value + " "
    }
}

function onBack(element, event) {
    var childs = $("#tag-div")[0].children
    if (event.keyCode == 8 && element.value == "" && childs.length > 1) {
        element.value = " "
        var lastTag = childs[childs.length - 2]
        lastTag.focus()
    }
}

function copy() {
    var text = document.getElementById("text-input").value
    var author = document.getElementById("author-input").value
    var authorTag = document.getElementById("author-tag-input")
    var tags = []
    $("#tag-div")[0].M_Chips.chipsData.forEach((tagChip) => {
        tags.push(tagChip.tag)
    })
    tags = tags.join(", ")

    console.log("got Data")

    var quoteString = `Text: ${text}\n\n\n` +
        `Urheber: ${author}\n\n\n` +
        `Urheber tag: @${author}\n\n\n` +
        `Tags: ${tags}`

    var copyText = $("#copy-text")
    copyText[0].value = quoteString
    var copyLabel = $("#copy-label")
    copyLabel.show()
    copyText.focus()

    copyText.select()
    try {
        copyText.setSelectionRange(0, 99999)
    } catch (error) {
        
    }

    document.execCommand("copy")
    
    copyText.prop("disabled", true);
}

function clearAll() {
    var copyText = $("#copy-text")
    copyText[0].value = ""
    var copyLabel = $("#copy-label")
    copyLabel.hide()
    copyText.prop("disabled", false);


    author = $("#author-input")
    author[0].value = ""

    document.getElementById("author-tag-input").value = ""

    tagDiv = document.getElementById("tag-div")
    while(tagDiv.M_Chips.chipsData.length > 0){
        tagDiv.M_Chips.deleteChip(0)
    }
    document.getElementById("tag-input").value = ""
    
    textInput = $("#text-input")
    textInput[0].value = ""
    
    author.focus()
    $("#author-tag-input").focus()
    $("#tag-input").focus()
    textInput.focus()
    
    textInput[0].parentElement.classList.remove("mdc-text-field--invalid")

    author[0].parentElement.classList.remove("mdc-text-field--invalid")
}