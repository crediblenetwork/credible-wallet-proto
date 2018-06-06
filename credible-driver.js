/*!
Author	 :	SmartPesa
Venture  :  Credible
Version	 :	0.1
Updated	 :	05.06.2018
*/

var url;

function setEndpoint(url) {
    parent.url = url;
}

function onGenerate() {
    return new Keys().Ed25519Keypair();
}

function requestApi(url, method, data, callback) {
    /* todo: check if rpc url ends with slash (/) */

    $.ajax({
        url: url,
        type: method,
        dataType: 'json',
        headers: {
            "Authorization": "Basic " + btoa("SmartPesa:Password"),
            "Content-Type": "application/json; charset=UTF-8"
        },
        data: method.toUpperCase() === "GET" ? "" : JSON.stringify(data),
        success: function (data) {
            callback(data);
        },
        error: function (xhr, textStatus, error) {
            alert(xhr.responseJSON.message);
        }
    });
}

function onSubmit() {
    let postData = {
        claim: $("#claim").val(),
        type: $("#type").val(),
        private_key: $("#key_private").val(),
        public_key: $("#key_public").val(),
    }
    requestApi(url + "add", "POST", postData, function (data) {
        $("#claim_hex").text(data.claim_hex);
        $("#nonce_hex").text(data.nonce_hex);
        $("#sign_id").text(data.sign_id);
        $("#txn_id").text(data.txn_id);
    });
}

function onTransfer() {
    $("#txn_id").text("");
    let postData = {
        sign_id: $("#sign_id").text(),
        from_private_key: previous_private,
        to_public_key: $("#key_public").val(),
    }
    requestApi(url + "transfer", "POST", postData, function (data) {
        $("#sign_id").text(data.sign_id);
        $("#txn_id").text(data.txn_id);

        //assign current private key to be the new previous
        previous_private = $("#key_private").val();
    });
}

function onSearch() {
    requestApi(url + "search?public_key=" + $("#key_public").val(), "GET", {}, function (data) {
        $("#div_transaction_ids").html('');
        for (var i = 0; i < data.length; i++) {
            $("#div_transaction_ids").append("<p><a href='javascript:onDetail(\"" + data[i].transaction_id + "\")'>" + data[i].transaction_id + "</a></p>");
        }
    });
}

function onDetail(transaction_id) {
    $("#txn_id").text("");
    requestApi(url + "gettransaction?transaction_id=" + transaction_id, "GET", {}, function (data) {
        $("#div_transaction_detail").html("<pre>" + JSON.stringify(data, null, 4) + "</pre>");
    });
}

var Keys = function () { }

Keys.prototype.Ed25519Keypair = function (seed) {
    const keyPair = seed ? nacl.sign.keyPair.fromSeed(seed) : nacl.sign.keyPair()
    return {
        publicKey: this.base58_encode(keyPair.publicKey),
        privateKey: this.base58_encode(keyPair.secretKey.slice(0, 32))
    }
}

Keys.prototype.base58_encode = function (source) {
    var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    var BASE = ALPHABET.length;
    var LEADER = ALPHABET.charAt(0)

    if (source.length === 0) return '';

    var digits = [0];
    for (var i = 0; i < source.length; ++i) {
        for (var j = 0, carry = source[i]; j < digits.length; ++j) {
            carry += digits[j] << 8;
            digits[j] = carry % BASE;
            carry = (carry / BASE) | 0;
        }

        while (carry > 0) {
            digits.push(carry % BASE);
            carry = (carry / BASE) | 0;
        }
    }

    var string = '';

    for (var k = 0; source[k] === 0 && k < source.length - 1; ++k) string += LEADER;
    for (var q = digits.length - 1; q >= 0; --q) string += ALPHABET[digits[q]];

    return string;
}