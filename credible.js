$(function() {
    var previous_private = $("#key_private").val();
    $("#btn_submit").click(onSubmit);
    $("#btn_transfer").click(onTransfer);
    $("#btn_search").click(onSearch);
});

function onGenerate() {
    previous_private = $("#key_private").val();
    const merchant = new BigchainDB.Ed25519Keypair();
    $("#key_private").val(merchant.privateKey);
    $("#key_public").val(merchant.publicKey);
}

function requestApi(url, method, data, callback) {
    $.ajax({
        url: "http://13.251.25.40/rpc-api/" + url,
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
        error: function(xhr, textStatus, error) {
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
    requestApi("add", "POST", postData, function(data) {
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
    requestApi("transfer", "POST", postData, function(data) {
        $("#sign_id").text(data.sign_id);
        $("#txn_id").text(data.txn_id);
        //assign current private key to be the new previous
        previous_private = $("#key_private").val();
    });
}

function onSearch() {
    requestApi("search?public_key=" + $("#key_public").val(), "GET", {}, function(data) {
        $("#div_transaction_ids").html('');
        for (var i = 0;i < data.length; i++) {
            $("#div_transaction_ids").append("<p><a href='javascript:onDetail(\"" + data[i].transaction_id + "\")'>" + data[i].transaction_id + "</a></p>");
        }
    });
}

function onDetail(transaction_id) {
    $("#txn_id").text("");  
    requestApi("gettransaction?transaction_id=" + transaction_id, "GET", {}, function(data) {
        $("#div_transaction_detail").html("<pre>" + JSON.stringify(data, null, 4) + "</pre>");
    });
}