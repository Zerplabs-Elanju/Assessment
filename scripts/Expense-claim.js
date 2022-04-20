document.cookie = "AccessToken=eyJraWQiOiJhZm5VVTd6STJzdk1ISEcydkl3eE44enlxU0NXck1NNSttUDUxYTZcL0Uydz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjNzRjYjg0OS0xNDQ5LTQ0YWUtYmU3YS0wNGU0OTRhNDczYmIiLCJhdWQiOiI3dDgwNzYzN3Q5bmdwYmI1ZHZrOWIwbXV0NSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJldmVudF9pZCI6Ijk5ZmExNmJkLTZlMGMtNGY5YS1hMjcxLWRkYjQ0NWM2NzBjYSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjQ5ODM0MTMxLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtbm9ydGgtMS5hbWF6b25hd3MuY29tXC9ldS1ub3J0aC0xXzZzMGFMblZFRSIsImNvZ25pdG86dXNlcm5hbWUiOiJjNzRjYjg0OS0xNDQ5LTQ0YWUtYmU3YS0wNGU0OTRhNDczYmIiLCJleHAiOjE2NDk4Mzc3MzEsImlhdCI6MTY0OTgzNDEzMSwiZW1haWwiOiJnb3V0aGFtQHppcml1cy5pbiJ9.R580LF99qt13mFQYayIY5XcDY3Cs4CRmsV9qz0ehRy02OgiGmu3zGqAm-WkRVtYk6x0f9E32JxIzPTeURCZey_fFGDk_ANow038blfkMvb5I6h1p-FHR4HlR1rNhYve54GUM7-os7tEcARs4ZpOXh1p1EzAoq69WqpUN44BSgCBYWcC0eqIoHKShosqNsAfYGjcEWVw-YielRbx5oinJ9vZlppY2HzRXjse4zm5L_6WpnitLsuDIfwxAta7Wx_0L7i6VdGheQDMClV1FiZkuP6TG29SusiSHCVn_Aa7NKb9HAXZzey6J7S0SaUaFshmemEkz8cUjwIt2rbnlZhAnjw"
loadData("http://localhost/ec/employees", "employee", "dropdownList", "value", "id")
loadData("http://localhost/ec/paymentMethod", "paymentMethod", "dropdownList", "value", "id")
loadData("http://localhost/ec/currencies", "currencies", "currencyList", "currencyName", "currencyCode")


var paymentType = {
    "ledgerTemplates": [{
        "id": 170,
        "code": "1",
        "name": "Faktura",
        "value": "1 - Faktura"
    }]
}

function setMaxDate() { document.getElementById("paymentDate").setAttribute("max", new Date().toISOString().split("T")[0]); }

function convertDate(stringDate) {
    var date = new Date(stringDate).getDate()
    var month = new Date(stringDate).getMonth() + 1
    var year = new Date(stringDate).getFullYear()
    return month + "/" + date + "/" + year
}

function loadData(url, position, listName, valueName, idValue) {
    var getRequestForDropdown = new XMLHttpRequest()
    getRequestForDropdown.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                json = JSON.parse(this.responseText)
                var feild = document.getElementById(position)
                var itr
                for (itr = 0; itr < json[listName].length; itr++) {
                    feild.innerHTML += "<option value=" + json[listName][itr][idValue] + ">" + json[listName][itr][valueName] + "</option>"
                }
                console.log(json)
            }
        }
    };
    getRequestForDropdown.open("GET", url, true)
    getRequestForDropdown.setRequestHeader("Access-Control-Allow-Origin", "*")
    getRequestForDropdown.setRequestHeader("authorization", "Bearer " + document.cookie.split("=")[1])
    getRequestForDropdown.setRequestHeader("companyid", "14")
    getRequestForDropdown.send()
}

function postData() {
    var url = new URL("http://localhost/ec/expense")
    var postRequestForCreateExpense = new XMLHttpRequest()
    postRequestForCreateExpense.onreadystatechange = function() {
        if (this.readyState == 4) {
            json = JSON.parse(this.responseText == "" ? '{"message" : "Unable to proccess the request"}' : this.responseText)
            if (this.status == 200) {
                alert("Data created sucessfully!!!")
                showCards()
                setActive(document.getElementById("navItemView"))
                document.forms[0].reset()
            } else {
                alert(json.message)
            }
        }
    };
    postRequestForCreateExpense.open("POST", url, true)
    postRequestForCreateExpense.setRequestHeader("Access-Control-Allow-Origin", "*")
    postRequestForCreateExpense.setRequestHeader("Content-Type", "application/json")
    postRequestForCreateExpense.setRequestHeader("authorization", "Bearer " + document.cookie.split("=")[1])
    postRequestForCreateExpense.setRequestHeader("companyid", "14")
    var formElements = document.getElementById('expenseClaimForm').getElementsByClassName('input');
    var obj = {
        "attachments": [],
        "amount": formElements[7].value,
        "currency": {
            "currencyCode": formElements[8].value
        },
        "employee": { "userId": parseInt(formElements[0].value) },
        "paymentType": {
            "id": parseInt(formElements[2].value)
        },
        "paymentMethod": {
            "id": parseInt(formElements[3].value)
        },
        "invoiceDate": formElements[4].value,
        "name": formElements[1].value,
        "notes": formElements[6].value,
        "payoutWithSalary": formElements[5].checked,
        "lineItems": [],
        "dimensions": []
    }
    json = JSON.stringify(obj)
    postRequestForCreateExpense.send(json);

}

function paymentTypeFunction() {
    document.getElementById("paymentType").innerHTML += "<option value=" + paymentType["ledgerTemplates"][0]["id"] + ">" + paymentType["ledgerTemplates"][0]["value"] + "</option>"
}

function showCards() {
    document.getElementById("expenseClaimFormContainer").style.display = "none"
    document.getElementById("viewData").style.display = "flex"
    errorClear()

    var url = new URL("http://localhost/ec/expenses/stage/Inbox?count=10&offset=0")
    var postRequestForCardView = new XMLHttpRequest()
    postRequestForCardView.onreadystatechange = function() {
        if (this.readyState == 4) {
            var response = JSON.parse(this.responseText == "" ? '{"message" : "Unable to proccess the request"}' : this.responseText)
            if (this.status == 200) {
                document.getElementById("cardHolder").innerHTML = ""
                for (var cards = 0; cards < response.expenses.length; cards++) {
                    var card = document.getElementById("card").cloneNode(true);
                    var spanElements = card.getElementsByTagName("span")
                    spanElements[0].innerHTML += response["expenses"][cards]["name"]
                    spanElements[1].innerHTML += response["expenses"][cards]["employee"]["name"]
                    spanElements[2].innerHTML += convertDate(response["expenses"][cards]["invoiceDate"].split("T")[0])
                    spanElements[3].innerHTML += response["expenses"][cards]["notes"].trim() == "" ? "N/A" : response["expenses"][cards]["notes"]
                    spanElements[3].setAttribute("title", response["expenses"][cards]["notes"].trim() == "" ? "N/A" : response["expenses"][cards]["notes"])
                    spanElements[4].innerHTML += convertAmount(response["expenses"][cards]["amount"])
                    spanElements[4].innerHTML += "&nbsp" + response["expenses"][cards]["currency"]["currencyCode"]
                    card.style.display = "flex"
                    card.id = response["expenses"][cards]["id"]
                    document.getElementById("cardHolder").append(card)
                }
            } else {
                alert(response.message)
            }
        }
    };
    postRequestForCardView.open("POST", url, true)
    postRequestForCardView.setRequestHeader("Access-Control-Allow-Origin", "*")
    postRequestForCardView.setRequestHeader("Content-Type", "application/json")
    postRequestForCardView.setRequestHeader("authorization", "Bearer " + document.cookie.split("=")[1])
    postRequestForCardView.setRequestHeader("companyid", "14")
    var obj = {}
    json = JSON.stringify(obj)
    postRequestForCardView.send(json);
}

function deleteData(elementId) {
    if (confirm("Are you sure you want to delete this?")) {
        var deleteRequest = new XMLHttpRequest()
        deleteRequest.onreadystatechange = function() {
            if (this.readyState == 4) {
                json = JSON.parse(this.responseText == "" ? '{"message" : "Unable to proccess the request"}' : this.responseText)
                if (this.status == 200) {
                    alert("Deleted Sucessfully")
                    showCards()
                } else {
                    alert(json.message)
                }
            }
        };
        url = "http://localhost/ec/expense/" + elementId
        deleteRequest.open("DELETE", url, true)
        deleteRequest.setRequestHeader("Access-Control-Allow-Origin", "*")
        deleteRequest.setRequestHeader("authorization", "Bearer " + document.cookie.split("=")[1])
        deleteRequest.setRequestHeader("companyid", "14")
        deleteRequest.send()
    }
}

function editData() {
    var elementId = document.getElementById("id").innerText
    var url = new URL("http://localhost/ec/expense?id=")
    var putRequest = new XMLHttpRequest()
    putRequest.onreadystatechange = function() {
        if (this.readyState == 4) {
            json = JSON.parse(this.responseText == "" ? '{"message" : "Unable to proccess the request"}' : this.responseText)
            if (this.status == 200) {
                var response = JSON.parse(this.responseText)
                showCards()
                alert("Data updated successfully")
                document.forms[0].reset()
                document.getElementById("edit").disabled = true
                console.log(response);
            } else {
                alert(json.message)
            }
        }
    };
    url = url + elementId
    putRequest.open("PUT", url, true)
    putRequest.setRequestHeader("Access-Control-Allow-Origin", "*")
    putRequest.setRequestHeader("Content-Type", "application/json")
    putRequest.setRequestHeader("authorization", "Bearer " + document.cookie.split("=")[1])
    putRequest.setRequestHeader("companyid", "14")
    var formElements = document.getElementById('expenseClaimForm').getElementsByClassName('input');
    var obj = {
        "attachments": [],
        "amount": formElements[7].value,
        "currency": {
            "currencyCode": formElements[8].value
        },
        "employee": { "userId": parseInt(formElements[0].value) },
        "paymentType": {
            "id": parseInt(formElements[2].value)
        },
        "paymentMethod": {
            "id": parseInt(formElements[3].value)
        },
        "invoiceDate": formElements[4].value,
        "name": formElements[1].value,
        "notes": formElements[6].value,
        "payoutWithSalary": formElements[5].checked,
        "lineItems": [],
        "dimensions": []
    }
    json = JSON.stringify(obj)
    putRequest.send(json);
}

async function getSetInduvidualData(elementId) {
    var getRequest = new XMLHttpRequest()
    getRequest.onreadystatechange = function() {
        if (this.readyState == 4) {
            json = JSON.parse(this.responseText == "" ? '{"message" : "Unable to proccess the request"}' : this.responseText)
            if (this.status == 200) {
                var formElements = document.getElementById('expenseClaimForm').getElementsByClassName('input');
                formElements[0].value = json["expense"]["employee"]["userId"]
                formElements[1].value = json["expense"]["name"]
                formElements[2].value = json["expense"]["paymentType"]["id"]
                formElements[3].value = json["expense"]["paymentMethod"]["id"]
                formElements[4].value = json["expense"]["invoiceDate"].split("T")[0]
                formElements[5].checked = json["expense"]["payoutWithSalary"]
                formElements[6].value = json["expense"]["notes"]
                formElements[7].value = convertAmount(json["expense"]["amount"])
                formElements[8].value = json["expense"]["currency"]["currencyCode"]
                document.getElementById("id").innerText = elementId
                formValidate(true, undefined)
            } else {
                alert(json.message)
            }
        }
    };
    url = "http://localhost/ec/expenses/" + elementId
    getRequest.open("GET", url, true)
    getRequest.setRequestHeader("Access-Control-Allow-Origin", "*")
    getRequest.setRequestHeader("authorization", "Bearer " + document.cookie.split("=")[1])
    getRequest.setRequestHeader("companyid", "14")
    getRequest.send()
}

function showFormForEdit(elementId) {
    document.getElementById("edit").style.display = "block"
    document.getElementById("create").style.display = "none"
    document.getElementById("expenseClaimFormContainer").style.display = "flex"
    document.getElementById("viewData").style.display = "none"
    document.forms[0].reset()
    getSetInduvidualData(elementId)
}

function showCreateForm() {
    document.getElementById("create").style.display = "block"
    document.getElementById("edit").style.display = "none"
    document.getElementById("expenseClaimFormContainer").style.display = "flex"
    document.getElementById("viewData").style.display = "none"
    errorClear()
    document.forms[0].reset()
}

function formValidate(validateWholeForm, ValidatingElement) {
    if (!document.forms[0].checkValidity()) {
        if (validateWholeForm) {
            var formElements = document.forms[0].elements
            for (const element of formElements) {
                var tag = element.parentElement.getElementsByClassName("error-feild")[0]
                if (element.tagName == "BUTTON") {
                    document.getElementById('create').disabled = !document.forms[0].checkValidity()
                    document.getElementById('edit').disabled = !document.forms[0].checkValidity()
                    return;
                } else if (element.checkValidity()) {
                    tag.innerHTML = "&nbsp;"
                } else {
                    tag.innerText = element.validationMessage
                }
            }
        } else {
            var tag = ValidatingElement.parentElement.getElementsByClassName("error-feild")[0]
            if (ValidatingElement.tagName == "BUTTON") {
                document.getElementById('create').disabled = !document.forms[0].checkValidity()
                document.getElementById('edit').disabled = !document.forms[0].checkValidity()
                return;
            } else if (ValidatingElement.checkValidity()) {
                tag.innerHTML = "&nbsp;"
            } else {
                tag.innerText = ValidatingElement.validationMessage
            }
        }
    } else {
        errorClear();
        if (ValidatingElement != undefined) {
            if (ValidatingElement.id == "create") {
                postData()
            } else if (ValidatingElement.id == "edit") {
                editData()
            }
        } else {
            return
        }

    }
    document.getElementById('create').disabled = !document.forms[0].checkValidity()
    document.getElementById('edit').disabled = !document.forms[0].checkValidity()
}

function setAmount(element) {
    element.value = convertAmount(element.value);
}

function convertAmount(amount) {
    return parseFloat(amount).toFixed(2);
}


function errorClear() {
    var formElements = document.forms[0].elements
    for (const element of formElements) {
        if (element.parentElement.getElementsByClassName('error-feild')[0] != undefined) {
            element.parentElement.getElementsByClassName('error-feild')[0].innerHTML = "&nbsp;"
        }
    }
}

function setActive(element) {
    var activeItem = document.getElementsByClassName("active")[0]
    activeItem.className = activeItem.className.replace(" active", "")
    element.className += " active"

}

function showNone() {
    document.getElementById("expenseClaimFormContainer").style.display = "none"
    document.getElementById("viewData").style.display = "none"
}

function cancelRedirection(element) {
    if (element.parentElement.getElementsByTagName("button")[1].style.display == "none") {
        document.forms[0].reset()
        errorClear()
    } else {
        showCards()
        errorClear()
        document.forms[0].reset()
    }
}