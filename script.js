function submit() {
    alert("submitted")
}

var snackbar
var select

$(function () {
    $("#copy-label").hide()

    initResize()

    mdc.ripple.MDCRipple.attachTo(document.querySelector('.copyRipple'));
    mdc.ripple.MDCRipple.attachTo(document.querySelector('.clearRipple'));
    mdc.ripple.MDCRipple.attachTo(document.querySelector('.login'));

    const MDCTextField = mdc.textField.MDCTextField
    const MDCSnackbar = mdc.snackbar.MDCSnackbar
    const MDCSelect = mdc.select.MDCSelect

    snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));

    //const tabBar = new mdc.MDCTabBar(document.querySelector('.mdc-tab-bar'));

    const text = new MDCTextField(document.querySelector('.text'));
    const author = new MDCTextField(document.querySelector('.author'));
    const authorTag = new MDCTextField(document.querySelector('.author-tag'))
    const tags = new MDCTextField(document.querySelector('.tags'))
    const copyText = new MDCTextField(document.querySelector('.copy-text'))

    select = new MDCSelect(document.querySelector('.dropdown'));
    //const select2 = new MDCSelect(document.querySelector('.dropdown2'));

    select.listen('MDCSelect:change', () => {
        storeServer()
        console.log(`Selected option at index ${select.selectedIndex} with value "${select.value}"`);
    });

    $('.chips').chips();

    tryGetGuilds()
});

function onTagFocus() {
    element = $("#tag-input")
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
    }
}

function copy() {
    textClassList = $("#text-input")[0].parentElement.classList.contains("mdc-text-field--invalid")
    authorClassList = $("#author-input")[0].parentElement.classList.contains("mdc-text-field--invalid")


    if (textClassList || authorClassList) {
        openSnackbar("Bitte alle erforderlichen Felder (*) ausfüllen", false)
        return
    }

    quoteString = generateQuoteText()

    var copyText = $("#copy-text")
    copyText[0].value = quoteString
    var copyLabel = $("#copy-label")
    copyLabel.show()
    copyText.focus()

    copyText.prop("disabled", false)

    copyText.select()

    document.execCommand("copy")

    copyText.prop("disabled", true);

    openSnackbar("Kopiert!", true)
}

function generateQuoteText() {
    var text = document.getElementById("text-input").value
    var author = document.getElementById("author-input").value
    var authorTag = document.getElementById("author-tag-input").value
    if (authorTag != "") {
        authorTag = "@" + authorTag
    } else {
        authorTag = "none"
    }
    var tags = []
    $("#tag-div")[0].M_Chips.chipsData.forEach((tagChip) => {
        tags.push(tagChip.tag)
    })
    tags = tags.join(", ")

    console.log("got Data")

    var quoteString = `Text: ${text}\n\n\n` +
        `Urheber: ${author}\n\n\n` +
        `Urheber tag: ${authorTag}\n\n\n` +
        `Tags: ${tags}`

    return quoteString
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
    while (tagDiv.M_Chips.chipsData.length > 0) {
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

    openSnackbar("Gelöscht!", true)
}

function openSnackbar(text, positive) {
    $("#snackbar")[0].classList.remove("snackbar--positive")
    $("#snackbar")[0].classList.remove("snackbar--negative")
    if (positive) {
        $("#snackbar")[0].classList.add("snackbar--positive")
    } else {
        $("#snackbar")[0].classList.add("snackbar--negative")
    }
    snackbar.labelText = text
    snackbar.open()
}


var observe;
if (window.attachEvent) {
    observe = function (element, event, handler) {
        element.attachEvent('on' + event, handler);
    };
}
else {
    observe = function (element, event, handler) {
        element.addEventListener(event, handler, false);
    };
}
function initResize() {
    var text = document.querySelector('.resize');
    function resize() {
        text.style.height = 'auto';
        text.style.height = text.scrollHeight + 'px';
    }
    /* 0-timeout to get the already changed text */
    function delayedResize() {
        window.setTimeout(resize, 0);
    }
    observe(text, 'change', resize);
    observe(text, 'cut', delayedResize);
    observe(text, 'paste', delayedResize);
    observe(text, 'drop', delayedResize);
    observe(text, 'keydown', delayedResize);

    text.focus();
    text.select();
    resize();
}