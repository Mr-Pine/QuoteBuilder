var authorizeURL = 'https://discord.com/api/oauth2/authorize';
var tokenURL = 'https://discord.com/api/oauth2/token';
var redirect_uri = "http://localhost:8100/"/* "http://quotes.inch3n.de/builder/" */
var serverURL = "http://raspberrypi.​mtxljeeh3dsnmpoj.​myfritz.​net:3000"//"http://localhost:3000"
let parameters = {}

getGuildsCountdown = 5

function getGetParameters() {
    bodyObject = {}
    body = location.href.split("?")[1]
    console.log(body)
    pairs = body.split("&")
    console.log(pairs)
    pairs.forEach(pair => {
        keyVal = pair.split("=")
        bodyObject[keyVal[0]] = keyVal[1]
    })

    return bodyObject
}

function getStoredData() {
    try {
        data = JSON.parse(getCookie("quote_data"))

        document.getElementById("text-input").value = data["text"]
        document.getElementById("author-input").value = data["author"]
        document.getElementById("author-tag-input").value = data["author_tag"]
        data["tags"].forEach(tag => {
            createChip(tag)
        })

        setCookie("quote_data", "", -10)
    }
    catch (e) {
        console.log("no data cached")
    }

}

async function tryGetGuilds() {
    access_cookie = getCookie("access_token")
    refresh_cookie = getCookie("refresh_token")

    getStoredData()

    try {
        parameters = getGetParameters()
    } catch (error) { }

    if (refresh_cookie != "") {

        console.log(access_cookie)
        getGuilds(access_cookie).then(guildJSON => {
            if (guildJSON["code"] != 0) {
                console.log("Guilds!")
                console.log(guildJSON)

                getValidServers().then(validGuilds => {

                    defaultServer = getCookie("default_server")

                    guildJSON.forEach(guild => {
                        valid = validGuilds.includes(guild.id)
                        if (valid) {
                            if (guild.id == defaultServer) {
                                $("#dropdown-list").append(`
                        <li class="mdc-list-item mdc-list-item--selected" data-value="${guild.id}">
                          <span class="mdc-list-item__ripple"></span>
                          <span class="mdc-list-item__text">${guild.name}</span>
                        </li>`)

                                $("#dropdown-selected-text").text(guild.name)

                            } else {
                                $("#dropdown-list").append(`
                        <li class="mdc-list-item" data-value="${guild.id}">
                          <span class="mdc-list-item__ripple"></span>
                          <span class="mdc-list-item__text">${guild.name}</span>
                        </li>`)
                            }
                        }

                        select.layout()
                        select.layoutOptions()
                    })

                    $(".logged-in").show()
                })


            } else {
                refreshAccessToken(refresh_cookie).then(tokenJSON => {
                    if (tokenJSON) {
                        access = tokenJSON["access_token"]
                        refresh = tokenJSON["refresh_token"]

                        setCookie("access_token", access, 1)
                        setCookie("refresh_token", refresh, 7)

                        if (getGuildsCountdown > 0) {
                            tryGetGuilds()
                            getGuildsCountdown--
                        }
                    }
                })
            }
        })
    } else if (parameters.code) {
        console.log("was redirected")
        getAccessToken(parameters.code).then((json) => {

            if (json) {
                access = json["access_token"]
                refresh = json["refresh_token"]

                setCookie("access_token", access, 1)
                setCookie("refresh_token", refresh, 7)

                if (getGuildsCountdown > 0) {
                    tryGetGuilds()
                    getGuildsCountdown--
                }
            }
        })
    }
}

function getNewCode() {
    console.log("getting new Code")
    setCookie("access_token", "", -10)
    setCookie("refresh_token", "", -10)

    //save content as cookies
    var text = document.getElementById("text-input").value
    var author = document.getElementById("author-input").value
    var authorTag = document.getElementById("author-tag-input").value
    var tags = getTagList()

    data = {
        text: text,
        author: author,
        author_tag: authorTag,
        tags: tags
    }

    setCookie("quote_data", JSON.stringify(data), 1)

    body = {
        client_id: secrets.client_id,
        redirect_uri: redirect_uri,
        response_type: "code",
        scope: "identify guilds"
    }
    redirectPost(authorizeURL, body);
}

async function getAccessToken(code) {
    response = await fetch(tokenURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlEncode({
            client_id: secrets.client_id,
            client_secret: secrets.client_secret,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirect_uri,
            scope: "guilds"
        })
    })
    return await response.json()
}

async function refreshAccessToken(token) {
    response = await fetch(tokenURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlEncode({
            client_id: secrets.client_id,
            client_secret: secrets.client_secret,
            grant_type: "refresh_token",
            refresh_token: token,
            redirect_uri: redirect_uri,
            scope: "identify guilds"
        })
    })
    return await response.json()
}

async function getGuilds(accesToken) {
    response = await fetch("https://discord.com/api/users/@me/guilds", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${accesToken}`
        }
    })
    return await response.json()
}

async function getUser(accesToken) {
    response = await fetch("https://discord.com/api/users/@me", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${accesToken}`
        }
    })
    return await response.json()
}

function redirectPost(location, args) {
    var form = '';
    $.each(args, function (key, value) {
        value = value.toString().split('"').join('\"')
        form += '<input type="hidden" name="' + key + '" value="' + value + '">';
    });
    $('<form action="' + location + '" method="GET">' + form + '</form>').appendTo($(document.body)).submit();
}

function urlEncode(obj) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}

function setCookie(cookieName, cookieValue, expiresInDays) {
    var d = new Date();
    d.setTime(d.getTime() + (expiresInDays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
}

function getCookie(cookieName) {
    var name = cookieName + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    for (var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) == 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}

async function sendQuote() {
    edit = $("#edit-switch").attr('aria-checked') == "true"
    console.log(edit)

    textClassList = $("#text-input")[0].parentElement.classList.contains("mdc-text-field--invalid")
    authorClassList = $("#author-input")[0].parentElement.classList.contains("mdc-text-field--invalid")
    selectClassList = $(".dropdown")[0].classList.contains("mdc-select--invalid")
    numberInput = edit && ($("#edit-number").val() == "")

    console.log(numberInput)


    if (textClassList || authorClassList || selectClassList || numberInput) {
        openSnackbar("Bitte alle erforderlichen Felder (*) ausfüllen", false)
        return
    }

    var response

    sendUrl = serverURL

    getUser(access_cookie).then(async function (userJSON) {

        var userID = await userJSON.id

        quoteString = generateQuoteText()

        bodyEncode = urlEncode({
            server: select.value,
            quote: quoteString,
            user: userID
        })

        if (edit) {
            sendUrl = serverURL + "/edit"

            bodyEncode = urlEncode({
                server: select.value,
                quote: quoteString,
                user: userID,
                number: $("#edit-number").val()
            })
        }

        response = await fetch(sendUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: bodyEncode
        })

        console.log(response)
    })

    return await response
}

async function getValidServers() {
    response = await fetch(serverURL + '/server-list', {
        method: 'GET',
        headers: { 'Content-Type': 'text/plain' }
    })

    return (await response.json())["servers"];
}

function storeServer() {
    id = select.value
    setCookie("default_server", id, 365)
}



async function deleteQuote() {
    var number = document.querySelector('#edit-number').value

    getUser(access_cookie).then(async function (userJSON) {

        var userID = await userJSON.id

        response = await fetch(serverURL + '/delete', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: urlEncode({
                number: number,
                server: select.value,
                user: userID
            })
        })
    })

    console.log(response)
}