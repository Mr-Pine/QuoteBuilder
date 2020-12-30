function submit() {
    alert("submitted")
}

var snackbar
var select
var chipSetEl
var chipSet

var tagInput

$(function () {

    new mdc.switchControl.MDCSwitch(document.querySelector('.mdc-switch'));

    $("#copy-label").hide()

    initResize()

    mdc.ripple.MDCRipple.attachTo(document.querySelector('.copyRipple'));
    mdc.ripple.MDCRipple.attachTo(document.querySelector('.clearRipple'));
    mdc.ripple.MDCRipple.attachTo(document.querySelector('.login'));


    const MDCTextField = mdc.textField.MDCTextField
    const MDCSnackbar = mdc.snackbar.MDCSnackbar
    const MDCSelect = mdc.select.MDCSelect
    const MDCSwitch = mdc.switchControl.MDCSwitch
    const MDCChipSet = mdc.chips.MDCChipSet

    snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));

    //const tabBar = new mdc.MDCTabBar(document.querySelector('.mdc-tab-bar'));

    const editNumber = new MDCTextField(document.querySelector('.number'))
    const text = new MDCTextField(document.querySelector('.text'));
    const author = new MDCTextField(document.querySelector('.author'));
    const authorTag = new MDCTextField(document.querySelector('.author-tag'))
    const tags = new MDCTextField(document.querySelector('.tags'))
    const copyText = new MDCTextField(document.querySelector('.copy-text'))

    chipSetEl = document.querySelector('.chips')
    chipSet = new MDCChipSet(chipSetEl)

    tagInput = document.querySelector('#tag-input')

    tagInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.keyCode === 13 || event.key === ',') {
            createChip()
        }
    });

    select = new MDCSelect(document.querySelector('.dropdown'));
    //const select2 = new MDCSelect(document.querySelector('.dropdown2'));

    select.listen('MDCSelect:change', () => {
        storeServer()
        console.log(`Selected option at index ${select.selectedIndex} with value "${select.value}"`);
    });

    tryGetGuilds()
});

function createChipButton() {
    createChip()
    tagInput.focus()
}

async function createChip(content) {
    chipContent = tagInput.value.trim()
    if(content) chipContent = content
    tagList = getTagList()


    if (!tagList.includes(chipContent) && chipContent != "") {
        htmlString = `
        <div class="mdc-chip mdc-chip--deletable" role="row">
                <div class="mdc-chip__ripple"></div>
                <span role="gridcell">
                    <span role="button" tabindex="0" class="mdc-chip__primary-action">
                        <span class="mdc-chip__text">${chipContent}</span>
                    </span>
                </span>
                <span role="gridcell">
                    <i class="material-icons mdc-chip__icon mdc-chip__icon--trailing mdc-chip-trailing-action" tabindex="-1"
                        role="button">cancel</i>
                </span>
            </div>
        `

        chipEl = createElementFromHTML(htmlString)

        chipSetEl.appendChild(chipEl);
        chipSet.addChip(chipEl);
    }
    setTimeout(() => {
        tagInput.value = "";
    }, 1)


}

function getTagList() {
    chipList = chipSet.chips
    tagList = []
    chipList.forEach(chip => {
        tagList.push(chip.root.children[1].innerText)
    })
    console.log(chipList)
    return tagList
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
}

function copy() {
    textClassList = $("#text-input")[0].parentElement.classList.contains("mdc-text-field--invalid")
    authorClassList = $("#author-input")[0].parentElement.classList.contains("mdc-text-field--invalid")
    authorTagClassList = $("#author-tag-input")[0].parentElement.classList.contains("mdc-text-field--invalid")


    if (textClassList || authorClassList || authorTagClassList) {
        openSnackbar("Bitte alle erforderlichen Felder (*) korrekt ausfüllen", false)
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
        authorTag = authorTag
    } else {
        authorTag = "none"
    }
    var tags = getTagList().join(', ')

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

    document.getElementById("tag-input").value = ""

    textInput = $("#text-input")
    textInput[0].value = ""

    author.focus()
    $("#author-tag-input").focus()
    $("#tag-input").focus()
    textInput.focus()

    textInput[0].parentElement.classList.remove("mdc-text-field--invalid")

    author[0].parentElement.classList.remove("mdc-text-field--invalid")

    $("#author-tag-input")[0].parentElement.classList.remove("mdc-text-field--invalid")

    chipList = chipSet.chips
    chipList.forEach(chip => {
        chip.beginExit()
    })

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