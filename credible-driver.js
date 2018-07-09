/*!
Author	 :	SmartPesa
Venture  :  Credible
Version	 :	0.1
Updated	 :	05.06.2018
*/

var _endPoint = "";

let credible_driver = function () { }

credible_driver.prototype.setEndpoint = function (url) {
    _endPoint = url.lastIndexOf("/") == url.length - 1 ? url : url + "/";
    _endPoint += 'credible-rpc-api/';
}

credible_driver.prototype.requestApi = function (url, method, data, callback) {
    $.ajax({
        url: _endPoint + url,
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
            alert(xhr.responseJSON !== undefined ? xhr.responseJSON.message : textStatus);
        }
    });
}

credible_driver.prototype.Submit = function (postData, callback) {
    this.requestApi("add", "POST", postData, callback);
}

credible_driver.prototype.Transfer = function (postData, callback) {
    this.requestApi("transfer", "POST", postData, callback);
}

credible_driver.prototype.Search = function (public_key, callback) {
    this.requestApi("search?public_key=" + public_key, "GET", {}, callback);
}

credible_driver.prototype.Detail = function (transaction_id, callback) {
    this.requestApi("gettransaction?transaction_id=" + transaction_id, "GET", {}, callback);
}

credible_driver.prototype.TokenBalance = function (public_key, callback) {
    this.requestApi("gettokenbalance?public_key=" + public_key, "GET", {}, callback);
}

credible_driver.prototype.Validators = function (callback) {
    this.requestApi("getvalidators", "GET", {}, callback);
}

credible_driver.prototype.GenerateKey = function () {
    return this.Ed25519Keypair();
}

credible_driver.prototype.Ed25519Keypair = function (seed) {
    const keyPair = seed ? nacl.sign.keyPair.fromSeed(seed) : nacl.sign.keyPair()
    return {
        publicKey: this.base58_encode(keyPair.publicKey),
        privateKey: this.base58_encode(keyPair.secretKey.slice(0, 32))
    }
}

credible_driver.prototype.base58_encode = function (source) {
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

var Credible = new credible_driver();