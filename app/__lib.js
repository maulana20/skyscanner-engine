function lowerCaseObjKeys (obj) {
    if (typeof obj != "object") {
        return obj
    }

    if (Array.isArray(obj)) {
        var data = []
        obj.forEach(function (item) {
            data.push(lowerCaseObjKeys(item))
        })
        return data
    }

    var data = {}
    Object.keys(obj).forEach(function (key) {
        data[key.toLowerCase()] = lowerCaseObjKeys(obj[key])
    })
    
    return data
}

module.exports = {
    lowerCaseObjKeys : lowerCaseObjKeys
}