module.exports = (function () {
    function JsonReturn() {
        this.code = 200;
        this.error = false;
        this.messages = [];
        this.form = {};
        this.content = {};

        this.hasForm = false;
        this.hasContent = false;
    }

    JsonReturn.prototype.setCode = function (code) {
        this.code = code;
        return this;
    };

    JsonReturn.prototype.getCode = function () {
        return this.code;
    };

    JsonReturn.prototype.addMessage = function (message) {
        this.messages.push(message);
        return this;
    };

    JsonReturn.prototype.addContent = function (key, value) {
        this.content[key] = value;
        this.hasContent = true;
        return this;
    };

    JsonReturn.prototype.generate = function () {
        const obj = {};

        obj.code = this.code;
        obj.error = this.error;
        obj.messages = this.messages;
        if (this.hasForm) obj.form = this.form;
        if (this.hasContent) obj.content = this.content;

        return obj;
    };

    return JsonReturn;
})();
